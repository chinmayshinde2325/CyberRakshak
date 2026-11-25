import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeDomainEntry, normalizeSiteUpdatesConfig, sanitizeActionUrl } from './siteUpdates.ts';
import { cleanTextForSpeech, splitSpeechChunks } from './speechPlayer.ts';

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

