import test from 'node:test';
import assert from 'node:assert/strict';
import { OtpStore } from './otpService.ts';
import { normalizeDomainEntry, normalizeSiteUpdatesConfig, sanitizeActionUrl } from './siteUpdates.ts';
import { cleanTextForSpeech, splitSpeechChunks } from './speechPlayer.ts';

test('OtpStore enforces generation, expiry, attempt caps, cooldown, and single-use HMAC verification', () => {
  const store = new OtpStore('unit-test-secret-key-minimum-32-chars');
  const t0 = 1_700_000_000_000;

  const badPhone = store.issueOtp('12345', t0);
  assert.equal(badPhone.ok, false);

  const issued = store.issueOtp('9823011223', t0);
  assert.equal(issued.ok, true);
  if (!issued.ok) return;
  assert.match(issued.code, /^\d{6}$/);

  // Cooldown prevents immediate resend
  const tooSoon = store.issueOtp('9823011223', t0 + 5_000);
  assert.equal(tooSoon.ok, false);
  if (!tooSoon.ok) assert.equal(tooSoon.code, 'cooldown');

  // Wrong code rejected with remainingAttempts
  const wrong = store.verifyOtp('9823011223', '000000', t0 + 6_000);
  assert.equal(wrong.ok, false);
  if (!wrong.ok && issued.code !== '000000') {
    assert.equal(wrong.code, 'mismatch');
    assert.equal(wrong.remainingAttempts, 4);
  }

  // Correct code succeeds & yields verifiable token
  const okRes = store.verifyOtp('+91 98230-11223', issued.code, t0 + 10_000);
  assert.equal(okRes.ok, true);
  if (!okRes.ok) return;
  const verifiedToken = store.verifyToken(okRes.token, t0 + 20_000);
  assert.equal(verifiedToken.valid, true);
  assert.equal(verifiedToken.phone, '919823011223');

  // Replay attempt fails because OTP is consumed
  const replay = store.verifyOtp('9823011223', issued.code, t0 + 11_000);
  assert.equal(replay.ok, false);

  // Expiry check
  const second = store.issueOtp('9823099887', t0 + 40_000);
  assert.equal(second.ok, true);
  if (second.ok) {
    const expired = store.verifyOtp('9823099887', second.code, t0 + 40_000 + 6 * 60_000);
    assert.equal(expired.ok, false);
    if (!expired.ok) assert.equal(expired.code, 'expired');
  }
});

test('sanitizeActionUrl blocks XSS schemes and allows safe web/tel/anchor links', () => {
  assert.equal(sanitizeActionUrl('javascript:alert(1)'), undefined);
  assert.equal(sanitizeActionUrl('data:text/html,<script>alert(1)</script>'), undefined);
  assert.equal(sanitizeActionUrl('vbscript:msgbox(1)'), undefined);
  assert.equal(sanitizeActionUrl('https://cybercrime.gov.in'), 'https://cybercrime.gov.in/');
  assert.equal(sanitizeActionUrl('tel:1930'), 'tel:1930');
  assert.equal(sanitizeActionUrl('#protect'), '#protect');
  assert.equal(sanitizeActionUrl('onlinesbi.sbi'), 'https://onlinesbi.sbi/');
});

test('normalizeSiteUpdatesConfig validates custom features, news, trusted domains, and strips unsafe URLs', () => {
  assert.equal(normalizeDomainEntry('https://www.NagpurPolice.gov.in/path'), 'nagpurpolice.gov.in');
  assert.equal(normalizeDomainEntry('not a domain'), null);

  const cfg = normalizeSiteUpdatesConfig({
    enabledModules: { sos_card: true, daily_tip: false, trusted_contacts: true, pin_hygiene: false },
    customFeatures: [
      {
        id: 'f1',
        title: 'Nagpur Cyber Cell',
        description: 'Direct regional complaint link.',
        badge: 'Nagpur',
        actionLabel: 'Open',
        actionUrl: 'javascript:alert(9)',
      },
      {
        id: 'f2',
        title: 'Senior Help Desk',
        description: 'Call helpline fast.',
        badge: 'Help',
        actionLabel: 'Call 1930',
        actionUrl: 'tel:1930',
      },
    ],
    customTrustedDomains: ['https://nagpurpolice.gov.in', 'bad domain'],
  });

  assert.equal(cfg.enabledModules.sos_card, true);
  assert.equal(cfg.enabledModules.trusted_contacts, true);
  assert.equal(cfg.customFeatures.length, 2);
  assert.equal(cfg.customFeatures[0].actionUrl, undefined);
  assert.equal(cfg.customFeatures[1].actionUrl, 'tel:1930');
  assert.deepEqual(cfg.customTrustedDomains, ['nagpurpolice.gov.in']);
});

test('cleanTextForSpeech removes markdown clutter and splitSpeechChunks splits long Devanagari/English replies', () => {
  const cleaned = cleanTextForSpeech('**डिजिटल अरेस्ट** झूठा है।\n* कभी *OTP* न दें।\n# कॉल 1930');
  assert.equal(cleaned.includes('*'), false);
  assert.equal(cleaned.includes('#'), false);
  assert.ok(cleaned.includes('डिजिटल अरेस्ट झूठा है।'));

  const longDevanagari =
    'नमस्कार, काळजी करू नका। डिजिटल अरेस्ट नावाची कोणतीही कायदेशीर गोष्ट नसते। पोलीस कधीही व्हिडिओ कॉलवर अटक करत नाहीत। कोणी पैसे मागितले तर तात्काळ १९३० वर कॉल करा।';
  const chunks = splitSpeechChunks(longDevanagari, 90);
  assert.ok(chunks.length >= 2);
  assert.ok(chunks.every((c) => c.length <= 105));
});

