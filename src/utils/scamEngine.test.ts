import test from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzeThreatDeterministic,
  buildWhatsAppAlertPayload,
  normalizeIndianPhone,
  scanDeviceWithPermissions,
  validateFamilyProfileInput,
} from './scamEngine.ts';

test('normalizeIndianPhone handles 10-digit, +91, and invalid inputs', () => {
  assert.deepEqual(normalizeIndianPhone('9823012345'), {
    local10: '9823012345',
    e164: '919823012345',
    valid: true,
  });
  assert.deepEqual(normalizeIndianPhone('+91 98230-12345'), {
    local10: '9823012345',
    e164: '919823012345',
    valid: true,
  });
  assert.equal(normalizeIndianPhone('12345').valid, false);
  assert.equal(normalizeIndianPhone('5123456789').valid, false);
});

test('validateFamilyProfileInput rejects missing required fields and passes valid setup', () => {
  const invalid = validateFamilyProfileInput({
    seniorName: '',
    seniorPhone: '123',
    caregiverName: 'R',
    caregiverPhone: '',
    permissions: { whatsappAlerts: false, messagesScan: false, storageScan: false },
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.seniorName);
  assert.ok(invalid.errors.seniorPhone);
  assert.ok(invalid.errors.caregiverName);
  assert.ok(invalid.errors.caregiverPhone);
  assert.ok(invalid.errors.permissions);

  const valid = validateFamilyProfileInput({
    seniorName: 'Madhavrao Deshmukh',
    seniorPhone: '9823011223',
    seniorEmail: '',
    caregiverName: 'Sneha Deshmukh',
    caregiverPhone: '+91 9823099887',
    caregiverEmail: 'sneha@example.com',
    permissions: { whatsappAlerts: true, messagesScan: true, storageScan: true },
  });
  assert.equal(valid.valid, true);
  assert.equal(valid.normalized?.seniorPhone, '9823011223');
  assert.equal(valid.normalized?.caregiverPhone, '9823099887');
});

test('analyzeThreatDeterministic accurately flags safe websites, bare phishing links, shorteners, and avoids bank-only assumptions', () => {
  // General safe websites -> Green (SAFE)
  for (const safeUrl of ['https://www.google.com', 'https://en.wikipedia.org/wiki/Nagpur', 'https://ycce.edu', 'https://onlinesbi.sbi']) {
    const res = analyzeThreatDeterministic(safeUrl, 'en');
    assert.equal(res.riskLevel, 'green', `Expected green for ${safeUrl}, got ${res.riskLevel}`);
    assert.equal(res.shouldNotifyCaregiver, false);
    assert.ok(!res.reasons.join(' ').toLowerCase().includes('not owned by any bank'));
  }

  // Standalone malicious links without urgency text -> Red (HIGH RISK)
  for (const badUrl of [
    'https://sbi-kyc-update.xyz',
    'https://prize-claim.top',
    'http://192.168.1.55/login-verify',
    'https://google.com@evil-phish.com',
  ]) {
    const res = analyzeThreatDeterministic(badUrl, 'en');
    assert.equal(res.riskLevel, 'red', `Expected red for ${badUrl}, got ${res.riskLevel}`);
    assert.equal(res.shouldNotifyCaregiver, true);
    assert.ok(res.detectedFlags.includes('fake_link'));
    assert.ok(!res.reasons.join(' ').toLowerCase().includes('not owned by any bank'));
  }

  // Shorteners / plain HTTP -> Yellow (CAUTION)
  const shortener = analyzeThreatDeterministic('https://bit.ly/3xYzAbc', 'en');
  assert.equal(shortener.riskLevel, 'yellow');
  assert.ok(shortener.detectedFlags.includes('shortener_link'));

  // Substring spoof trap must NOT match trusted domain
  const substringSpoof = analyzeThreatDeterministic('https://onlinesbi.sbi.evil-verify.com', 'en');
  assert.equal(substringSpoof.riskLevel, 'red');

  // Extra custom trusted domain works
  const customSafe = analyzeThreatDeterministic('http://myclinic.example.org', 'en', ['myclinic.example.org']);
  assert.equal(customSafe.riskLevel, 'yellow'); // http still flagged for caution unless https
  const customHttpsSafe = analyzeThreatDeterministic('https://myclinic.example.org', 'en', ['myclinic.example.org']);
  assert.equal(customHttpsSafe.riskLevel, 'green');
});

test('analyzeThreatDeterministic accurately flags KYC, Digital Arrest, and APK text', () => {
  const kyc = analyzeThreatDeterministic(
    'Your SBI account will be suspended today. Update KYC: sbi-kyc-update.xyz',
    'en',
  );
  assert.equal(kyc.riskLevel, 'red');
  assert.equal(kyc.shouldNotifyCaregiver, true);
  assert.ok(kyc.detectedFlags.includes('fake_link'));
  assert.ok(kyc.detectedFlags.includes('urgency'));

  const digitalArrest = analyzeThreatDeterministic(
    'CBI Customs officer: Aadhaar blocked, stay on video call for digital arrest',
    'mr',
  );
  assert.equal(digitalArrest.riskLevel, 'red');
  assert.equal(digitalArrest.category, 'digital_arrest');

  const apk = analyzeThreatDeterministic('Install SBI-KYC-Update.apk via WhatsApp', 'vrh');
  assert.equal(apk.riskLevel, 'red');
  assert.equal(apk.category, 'apk_malware');
});

test('buildWhatsAppAlertPayload creates wa.me URL and respects privacy consent', () => {
  const baseProfile = validateFamilyProfileInput({
    seniorName: 'Asha Kulkarni',
    seniorPhone: '9823011111',
    caregiverName: 'Rohan Kulkarni',
    caregiverPhone: '9823022222',
    permissions: { whatsappAlerts: true, messagesScan: true, storageScan: true },
    privacyShareRawMessage: false,
  }).normalized!;

  const hiddenAlert = buildWhatsAppAlertPayload({
    profile: baseProfile,
    riskLevel: 'red',
    category: 'kyc',
    sourceType: 'website',
    targetSummary: 'sbi-kyc-update.xyz',
    maskedReason: 'Fake link detected',
    rawSnippet: 'Secret OTP 998877',
    lang: 'en',
  });
  assert.ok(hiddenAlert.whatsappUrl.startsWith('https://wa.me/919823022222?text='));
  assert.equal(hiddenAlert.rawSnippet, undefined);
  assert.ok(!hiddenAlert.whatsappMessage.includes('998877'));

  const consentedAlert = buildWhatsAppAlertPayload({
    profile: { ...baseProfile, privacyShareRawMessage: true },
    riskLevel: 'red',
    category: 'kyc',
    sourceType: 'sms',
    targetSummary: 'Fake KYC SMS',
    maskedReason: 'Fake link detected',
    rawSnippet: 'Urgent KYC sbi-kyc-update.xyz',
    lang: 'mr',
  });
  assert.equal(consentedAlert.rawSnippet, 'Urgent KYC sbi-kyc-update.xyz');
  assert.ok(consentedAlert.whatsappMessage.includes('sbi-kyc-update.xyz'));
});

test('scanDeviceWithPermissions only scans enabled permission modules', () => {
  const storageOnly = scanDeviceWithPermissions(
    { whatsappAlerts: false, messagesScan: false, storageScan: true },
    'en',
  );
  assert.equal(storageOnly.items.every((i) => i.source === 'storage'), true);
  assert.deepEqual(storageOnly.blockedModules, ['messages', 'whatsapp']);
});

test('buildWhatsAppAlertPayload handles null profile safely for guest Scam Gym usage', () => {
  const guestAlert = buildWhatsAppAlertPayload({
    profile: null,
    riskLevel: 'red',
    category: 'apk_malware',
    sourceType: 'app',
    targetSummary: 'SBI-KYC-Support-v4.apk',
    maskedReason: 'Fake banking APK blocked.',
    lang: 'en',
  });
  assert.equal(guestAlert.riskLevel, 'red');
  assert.equal(guestAlert.dispatchedViaWhatsApp, false);
  assert.equal(guestAlert.whatsappUrl, '');
});
