import type {
  AlertSourceType,
  CaregiverAlert,
  FamilyProfile,
  LanguageCode,
  RiskLevel,
  SafetyPermissions,
  ScamCategory,
  ThreatAnalysisResult,
} from '../types/suraksha.ts';

export interface ProfileValidationResult {
  valid: boolean;
  errors: Partial<
    Record<
      'seniorName' | 'seniorPhone' | 'seniorEmail' | 'caregiverName' | 'caregiverPhone' | 'caregiverEmail' | 'permissions',
      string
    >
  >;
  normalized?: FamilyProfile;
}

export function normalizeIndianPhone(raw: string): { local10: string; e164: string; valid: boolean } {
  const digits = String(raw || '').replace(/\D/g, '');
  let local10 = digits;
  if (digits.length === 12 && digits.startsWith('91')) {
    local10 = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    local10 = digits.slice(1);
  }
  const valid = /^[6-9]\d{9}$/.test(local10);
  return {
    local10,
    e164: valid ? `91${local10}` : '',
    valid,
  };
}

function isValidOptionalEmail(email?: string): boolean {
  const trimmed = (email || '').trim();
  if (!trimmed) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export function validateFamilyProfileInput(input: {
  seniorName: string;
  seniorPhone: string;
  seniorEmail?: string;
  caregiverName: string;
  caregiverPhone: string;
  caregiverEmail?: string;
  permissions: SafetyPermissions;
  privacyShareRawMessage?: boolean;
}): ProfileValidationResult {
  const errors: ProfileValidationResult['errors'] = {};

  const sName = (input.seniorName || '').trim();
  const cName = (input.caregiverName || '').trim();
  const sPhone = normalizeIndianPhone(input.seniorPhone);
  const cPhone = normalizeIndianPhone(input.caregiverPhone);

  if (sName.length < 2) errors.seniorName = 'required_name';
  if (!sPhone.valid) errors.seniorPhone = 'invalid_phone';
  if (!isValidOptionalEmail(input.seniorEmail)) errors.seniorEmail = 'invalid_email';

  if (cName.length < 2) errors.caregiverName = 'required_name';
  if (!cPhone.valid) errors.caregiverPhone = 'invalid_phone';
  if (!isValidOptionalEmail(input.caregiverEmail)) errors.caregiverEmail = 'invalid_email';

  if (
    !input.permissions.whatsappAlerts &&
    !input.permissions.messagesScan &&
    !input.permissions.storageScan
  ) {
    errors.permissions = 'enable_at_least_one_permission';
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: {},
    normalized: {
      seniorName: sName,
      seniorPhone: sPhone.local10,
      seniorEmail: (input.seniorEmail || '').trim() || undefined,
      caregiverName: cName,
      caregiverPhone: cPhone.local10,
      caregiverEmail: (input.caregiverEmail || '').trim() || undefined,
      permissions: { ...input.permissions },
      privacyShareRawMessage: Boolean(input.privacyShareRawMessage),
      completedAt: new Date().toISOString(),
    },
  };
}

const TRUSTED_DOMAINS = [
  'onlinesbi.sbi',
  'sbi.co.in',
  'hdfcbank.com',
  'icicibank.com',
  'bankofmaharashtra.in',
  'npci.org.in',
  'rbi.org.in',
  'cybercrime.gov.in',
  'mahadiscom.in',
  'uidai.gov.in',
  'jeevanpramaan.gov.in',
  'gov.in',
  'nic.in',
  'irctc.co.in',
  'google.com',
  'google.co.in',
  'youtube.com',
  'wikipedia.org',
  'microsoft.com',
  'apple.com',
  'amazon.in',
  'amazon.com',
  'flipkart.com',
  'whatsapp.com',
  'openai.com',
  'github.com',
];

const SUSPICIOUS_TLDS = [
  '.xyz',
  '.tk',
  '.top',
  '.click',
  '.club',
  '.buzz',
  '.work',
  '.loan',
  '.gq',
  '.ml',
  '.cf',
  '.ga',
  '.pw',
  '.icu',
  '.sbs',
  '.cfd',
  '.online',
  '.site',
];
const SHORTENER_HOSTS = ['bit.ly', 'tinyurl.com', 't.co', 'shorturl.at', 'rb.gy', 'rebrand.ly', 'cutt.ly'];

const SPOOF_BRAND_REGEX =
  /(^|[.-])(sbi|hdfc|icici|axis|kotak|rbi|npci|mahadiscom|msedcl|jeevanpramaan|uidai|aadhaar|pan|paytm|phonepe|gpay|amazon|flipkart|cbi|police|customs|pension)[-_a-z0-9]*/i;

const PHISHING_PATH_REGEX =
  /\/(kyc[-_]?update|verify[-_]?(pan|kyc|account|login|otp)|claim[-_]?(prize|reward|refund)|digital[-_]?arrest|unlock[-_]?account|suspend)/i;

interface ParsedCandidateUrl {
  raw: string;
  protocol: 'http:' | 'https:';
  hostname: string;
  pathname: string;
  hasUserinfoTrap: boolean;
  isIpHost: boolean;
  isPunycode: boolean;
}

function hostMatchesDomain(hostname: string, domain: string): boolean {
  const cleanHost = hostname.toLowerCase().replace(/^www\./, '');
  const cleanDomain = domain.toLowerCase().replace(/^www\./, '');
  return cleanHost === cleanDomain || cleanHost.endsWith(`.${cleanDomain}`);
}

function isIpv4Host(hostname: string): boolean {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);
}

function extractCandidateUrls(text: string): ParsedCandidateUrl[] {
  const results: ParsedCandidateUrl[] = [];
  const seen = new Set<string>();
  const tokens = text.split(/[\s<>"'()[\],;]+/);

  for (const rawToken of tokens) {
    const token = rawToken.replace(/[.!?]+$/, '').trim();
    if (!token || token.length < 4) continue;

    // Ignore emails (unless credential-style URL with scheme)
    if (!/^https?:\/\//i.test(token) && token.includes('@')) continue;

    const looksLikeUrl =
      /^https?:\/\//i.test(token) ||
      (/^[a-z0-9.-]+\.[a-z]{2,24}(\/[^\s]*)?$/i.test(token) && !/\.apk$/i.test(token));

    if (!looksLikeUrl) continue;

    const withScheme = /^https?:\/\//i.test(token) ? token : `https://${token}`;
    try {
      const parsed = new URL(withScheme);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') continue;
      const hostname = parsed.hostname.toLowerCase();
      if (!hostname || (!hostname.includes('.') && !isIpv4Host(hostname))) continue;
      if (seen.has(parsed.toString())) continue;
      seen.add(parsed.toString());

      results.push({
        raw: token,
        protocol: parsed.protocol,
        hostname,
        pathname: parsed.pathname + parsed.search,
        hasUserinfoTrap: Boolean(parsed.username || parsed.password || token.includes('@')),
        isIpHost: isIpv4Host(hostname) || hostname.startsWith('['),
        isPunycode: hostname.split('.').some((label) => label.startsWith('xn--')),
      });
    } catch {
      // Ignore malformed URL token
    }
  }

  return results;
}

interface LocalizedThreatCopy {
  reasons: Record<string, string>;
  nextSteps: Record<RiskLevel, string[]>;
}

const THREAT_COPY: Record<LanguageCode, LocalizedThreatCopy> = {
  en: {
    reasons: {
      urgency: 'Creates panic or artificial deadline ("today", "immediately", "blocked").',
      fake_link: 'Suspicious domain, deceptive address (@/IP/punycode), or lookalike phishing link detected.',
      shortener_link: 'Uses a shortened or unencrypted (HTTP) web link whose real destination is hidden.',
      otp_pin: 'Asks for OTP, ATM PIN, CVV, or MPIN — never share private codes over links or calls.',
      digital_arrest: 'Threatens police, CBI, ED, or Customs "Digital Arrest" — Indian law has no Digital Arrest.',
      apk_remote: 'Asks to install an APK file or remote screen-sharing app (AnyDesk / QuickSupport).',
      lottery_fee: 'Promises a lottery/prize and demands a processing fee or tax upfront.',
      trusted_site: 'Verified clean HTTPS website with no scam, phishing, or malware signals detected.',
      unknown_caution: 'Plain text or unverified sender without a scam trigger — verify independently before acting.',
    },
    nextSteps: {
      red: [
        'STOP immediately. Do not open the link, install any app, or transfer money.',
        'Call 1930 (National Cybercrime Helpline) or verify on an official helpline directly.',
        'Your registered caregiver can be alerted with this warning.',
      ],
      yellow: [
        'Pause and verify who sent this before entering any personal details or passwords.',
        'Never share any OTP or install files from unknown SMS or WhatsApp messages.',
      ],
      green: [
        'This link looks clean and safe to browse, though you should still never share private OTPs or PINs.',
      ],
    },
  },
  hi: {
    reasons: {
      urgency: 'डर और जल्दबाज़ी पैदा करता है ("आज ही", "तुरंत", "बंद")।',
      fake_link: 'संदिग्ध डोमेन, भ्रामक पता (IP/@) या नकली फ़िशिंग लिंक पाया गया है।',
      shortener_link: 'छोटा किया हुआ (shortened) या असुरक्षित HTTP लिंक है जिसकी असली वेबसाइट छिपी है।',
      otp_pin: 'OTP, ATM PIN, CVV या MPIN माँगता है — निजी कोड कभी किसी से साझा न करें।',
      digital_arrest: 'पुलिस, CBI, ED या कस्टम द्वारा "डिजिटल अरेस्ट" की धमकी देता है — कानून में ऐसा कुछ नहीं होता।',
      apk_remote: 'APK फ़ाइल या स्क्रीन-शेयरिंग ऐप (AnyDesk / QuickSupport) इंस्टॉल करने को कहता है।',
      lottery_fee: 'लॉटरी या इनाम का लालच देकर पहले फीस या टैक्स माँगता है।',
      trusted_site: 'यह सुरक्षित और साफ HTTPS वेबसाइट प्रतीत होती है, कोई फ्रॉड संकेत नहीं मिला।',
      unknown_caution: 'स्पष्ट फ्रॉड शब्द नहीं मिला, फिर भी कोई जानकारी देने से पहले प्रेषक की पुष्टि करें।',
    },
    nextSteps: {
      red: [
        'तुरंत रुकें! लिंक न खोलें, कोई ऐप डाउनलोड न करें और पैसे न भेजें।',
        '1930 (राष्ट्रीय साइबर हेल्पलाइन) पर कॉल करें या आधिकारिक नंबर से पुष्टि करें।',
        'आपके केयरगिवर (परिजन) को सुरक्षा अलर्ट भेजा जा सकता है।',
      ],
      yellow: [
        'रुकें और आगे बढ़ने से पहले भेजने वाले की पुष्टि करें।',
        'WhatsApp या SMS से आए अनजान लिंक पर OTP या पासवर्ड न डालें।',
      ],
      green: [
        'यह वेबसाइट सुरक्षित प्रतीत होती है, फिर भी अपना OTP या पिन किसी को न बताएं।',
      ],
    },
  },
  mr: {
    reasons: {
      urgency: '"आजच", "तातडीने" किंवा "बंद होईल" अशी भीती व घाई दाखवली आहे.',
      fake_link: 'संशयास्पद डोमेन, फसवा पत्ता (IP/@) किंवा बनावट फिशिंग लिंक आढळली आहे.',
      shortener_link: 'लपवलेली शॉर्ट लिंक किंवा असुरक्षित HTTP दुवा आहे — खरी वेबसाइट तपासणे गरजेचे आहे.',
      otp_pin: 'OTP, ATM PIN, CVV किंवा MPIN विचारत आहे — खाजगी कोड कधीही शेअर करू नका.',
      digital_arrest: 'पोलीस, CBI, ED किंवा कस्टमच्या नावाने "डिजिटल अरेस्ट" ची धमकी देतो — असा कोणताही कायदा नाही.',
      apk_remote: 'APK फाईल किंवा स्क्रीन शेअरिंग अ‍ॅप (AnyDesk / QuickSupport) डाऊनलोड करायला सांगतो.',
      lottery_fee: 'लॉटरी किंवा बक्षिसाचे आमिष दाखवून आधी शुल्क भरायला सांगतो.',
      trusted_site: 'हे सुरक्षित व स्वच्छ HTTPS संकेतस्थळ दिसते; कोणताही फसवणुकीचा धोका आढळला नाही.',
      unknown_caution: 'थेट धोकादायक शब्द नसले तरी कोणतीही कृती करण्यापूर्वी खात्री करून घ्या.',
    },
    nextSteps: {
      red: [
        'तात्काळ थांबा! लिंक उघडू नका, कोणतेही अ‍ॅप घेऊ नका व पैसे पाठवू नका.',
        '१९३० (सायबर हेल्पलाइन) किंवा कुटुंबाशी त्वरित संपर्क साधा.',
        'तुमच्या केअरगिव्हरला तातडीचा सुरक्षा इशारा पाठवला जाऊ शकतो.',
      ],
      yellow: [
        'थांबा आणि माहिती टाकण्यापूर्वी पाठवणाऱ्याची खात्री करा.',
        'SMS किंवा WhatsApp वर आलेल्या अनोळखी लिंकवर OTP देऊ नका.',
      ],
      green: [
        'ही लिंक सुरक्षित दिसते, तरीही आपला OTP किंवा PIN कोणासोबतही शेअर करू नका.',
      ],
    },
  },
  vrh: {
    reasons: {
      urgency: '"आजच्या आज", "तातडीनं" आन "बंद होईन" म्हनून घाबरवून राहिले हाये.',
      fake_link: 'खोटी किंवा फसवणूक करणारी लिंक आढळली हाये — ही खरी वेबसाइट दिसत नाय.',
      shortener_link: 'लपवलेली छोटी लिंक किंवा साधी HTTP लिंक हाये, आधी खात्री करून घ्या.',
      otp_pin: 'OTP, PIN किंवा CVV मांगत हाये — असे नंबर कोनालेबी सांगू नका.',
      digital_arrest: 'पोलीस, CBI च्या नावानं "डिजिटल अरेस्ट" ची धमकी देत हाये — असा कायदा भारतात नाय.',
      apk_remote: 'APK फाईल किंवा स्क्रीन दाखवनारं अ‍ॅप (AnyDesk) टाकाले सांगून राहिलं.',
      lottery_fee: 'लाखो रुपयाची लॉटरी लागली म्हनून आधी पैसे भरायले लावत हाये.',
      trusted_site: 'ही वेबसाइट सुरक्षित आन स्वच्छ दिसून राहिली, कोनताबी फ्रॉड संकेत नाय.',
      unknown_caution: 'सगळं नक्की माहीत नसल्यास घरच्यांले विचारल्याबिगर काई करू नका.',
    },
    nextSteps: {
      red: [
        'थांबा! या लिंकवर टिचकी मारू नका आन पैसेबी पाठवू नका.',
        'लगेच १९३० वर फोन लावा किंवा घरच्यांले विचारा.',
        'तुमच्या घरच्या केअरगिव्हरले व्हॉट्सअ‍ॅप अलर्ट धाडला जाऊ शकते.',
      ],
      yellow: [
        'जरा थांबा आन घरच्या मानसांले विचारूनच पुढचं पाऊल टाका.',
        'अनोळखी लिंकवर OTP टाकू नका.',
      ],
      green: [
        'ही साइट सुरक्षित हाये, तरी पिन आन OTP कोनालेबी सांगू नका.',
      ],
    },
  },
  gon: {
    reasons: {
      urgency: '"नेनेच", "तातकाळ" बंद वंता मंदोर — बेगार घाई कयना.',
      fake_link: 'संदिग्ध या खोटा फिशिंग लिंक मिळाला मंता.',
      shortener_link: 'लपवला शॉर्ट लिंक या HTTP पत्ता मंता — अगाडी खात्री कयका.',
      otp_pin: 'OTP, ATM पिन या CVV मांगता — कोनाले बी पिन वेहना आयो.',
      digital_arrest: 'पुलिस, CBI ना नाव ते "डिजिटल अरेस्ट" धमकी देता — इहून कानून भारत ते आयो.',
      apk_remote: 'APK फाइल या स्क्रीन शेयरिंग ऐप (AnyDesk) इंस्टॉल कयना वेहता.',
      lottery_fee: 'इनाम या लॉटरी वेहसी पहले पैसा मांगता.',
      trusted_site: 'इद सुरक्षित अनी साफ HTTPS वेबसाइट मंता; कोणता बी धोका नाय.',
      unknown_caution: 'संदेह वाटले ते कुटुंब ना मानूस संगे विचार कयका.',
    },
    nextSteps: {
      red: [
        'तातकाळ थांबा! लिंक खोलना आयो अनी पैसा पठोना आयो.',
        '१९३० साइबर हेल्पलाइन वर तात्काळ फोन कयका.',
        'तुमचा केअरगिव्हर ले व्हॉट्सअ‍ॅप सुरक्षा अलर्ट पठोता.',
      ],
      yellow: [
        'थांबा अनी घरी मानूस संगे विचार कयसी आगे वधा.',
        'कोनाले बी OTP वेहना आयो.',
      ],
      green: [
        'इद सुरक्षित वेबसाइट मंता, तरी आपला OTP कोनाले सांगना आयो.',
      ],
    },
  },
};

export function analyzeThreatDeterministic(
  rawInput: string,
  lang: LanguageCode = 'en',
  extraTrustedDomains: string[] = [],
): ThreatAnalysisResult {
  const text = (rawInput || '').trim();
  const lower = text.toLowerCase();
  const copy = THREAT_COPY[lang] || THREAT_COPY.en;

  const detectedFlags: string[] = [];
  let score = 0;
  let category: ScamCategory = 'unknown';

  const allTrusted = [...TRUSTED_DOMAINS, ...extraTrustedDomains];
  const urls = extractCandidateUrls(text);

  let anyTrustedUrl = false;
  let anyCleanHttpsUrl = false;
  let hasFakeUrl = false;
  let hasShortenerOrHttp = false;

  for (const u of urls) {
    const isTrusted =
      allTrusted.some((dom) => hostMatchesDomain(u.hostname, dom)) &&
      !u.hasUserinfoTrap &&
      !u.isIpHost &&
      !u.isPunycode;

    if (isTrusted && u.protocol === 'https:') {
      anyTrustedUrl = true;
      continue;
    }

    const isShortener = SHORTENER_HOSTS.some((sh) => hostMatchesDomain(u.hostname, sh));
    const hasSuspiciousTld = SUSPICIOUS_TLDS.some((tld) => u.hostname.endsWith(tld));
    const hasSpoofPattern =
      (SPOOF_BRAND_REGEX.test(u.hostname) && !isTrusted) ||
      PHISHING_PATH_REGEX.test(u.pathname);

    if (u.hasUserinfoTrap || u.isIpHost || u.isPunycode || hasSuspiciousTld || hasSpoofPattern) {
      hasFakeUrl = true;
    } else if (isShortener || u.protocol === 'http:') {
      hasShortenerOrHttp = true;
    } else if (u.protocol === 'https:') {
      anyCleanHttpsUrl = true;
    }
  }

  // Catch bare obfuscated tokens like "sbi-kyc.xyz" when URL parser didn't catch them
  if (!hasFakeUrl && !anyTrustedUrl) {
    const bareBadTld = SUSPICIOUS_TLDS.some((tld) =>
      new RegExp(`[a-z0-9-]${tld.replace('.', '\\.')}(\\b|/|\\?)`, 'i').test(lower),
    );
    if (bareBadTld) {
      hasFakeUrl = true;
    }
  }

  const hasApkOrRemote =
    /\.apk\b|anydesk|quicksupport|teamviewer|rustdesk|screen\s?shar/i.test(lower);
  const hasDigitalArrest =
    /digital\s?arrest|cbi\b|customs\b|narcotics|enforcement\s?directorate|supreme\s?court|warrant|stay on (the )?video|trai\b|aadhaar\s?block/i.test(
      lower,
    );
  const hasOtpOrPin =
    /\botp\b|\bcvv\b|\bmpin\b|atm\s?pin|share\s?(your )?(code|otp|pin)|bank\s?officer/i.test(lower);
  const hasUrgency =
    /\btoday\b|immediately|suspended|blocked|expire|within \d+ hour|urgent|disconnect|verify now|kyc/i.test(lower);
  const hasLottery =
    /lottery|won\s?₹?|25\s?lakh|kbc|prize|claim\s?fee|processing\s?fee|lucky\s?draw/i.test(lower);

  if (hasApkOrRemote) {
    detectedFlags.push('apk_remote');
    score += 60;
    category = 'apk_malware';
  }
  if (hasDigitalArrest) {
    detectedFlags.push('digital_arrest');
    score += 60;
    if (category === 'unknown') category = 'digital_arrest';
  }
  if (hasOtpOrPin) {
    detectedFlags.push('otp_pin');
    score += 50;
    if (category === 'unknown') category = 'otp';
  }
  if (hasFakeUrl) {
    detectedFlags.push('fake_link');
    score += 55;
    if (category === 'unknown') category = 'kyc';
  } else if (hasShortenerOrHttp) {
    detectedFlags.push('shortener_link');
    score += 28;
    if (category === 'unknown') category = 'kyc';
  }
  if (hasLottery) {
    detectedFlags.push('lottery_fee');
    score += 50;
    if (category === 'unknown') category = 'lottery';
  }
  if (hasUrgency) {
    detectedFlags.push('urgency');
    score += 25;
    if (category === 'unknown') category = 'kyc';
  }

  // Clean trusted URL or clean public HTTPS URL with zero risk signals -> Green (SAFE)
  if ((anyTrustedUrl || anyCleanHttpsUrl) && detectedFlags.length === 0) {
    return {
      riskLevel: 'green',
      score: anyTrustedUrl ? 5 : 10,
      category: 'safe',
      detectedFlags: ['trusted_site'],
      reasons: [copy.reasons.trusted_site],
      nextSteps: copy.nextSteps.green,
      shouldNotifyCaregiver: false,
    };
  }

  const clampedScore = Math.min(100, score);
  let riskLevel: RiskLevel = 'yellow';
  if (
    clampedScore >= 50 ||
    hasApkOrRemote ||
    hasDigitalArrest ||
    hasFakeUrl ||
    (hasShortenerOrHttp && hasUrgency)
  ) {
    riskLevel = 'red';
  } else if (clampedScore === 0) {
    riskLevel = 'yellow';
    detectedFlags.push('unknown_caution');
  }

  const reasons = detectedFlags.map((f) => copy.reasons[f]).filter(Boolean);
  if (reasons.length === 0) reasons.push(copy.reasons.unknown_caution);

  return {
    riskLevel,
    score: clampedScore,
    category,
    detectedFlags,
    reasons,
    nextSteps: copy.nextSteps[riskLevel],
    shouldNotifyCaregiver: riskLevel === 'red',
  };
}

export function buildWhatsAppAlertPayload(params: {
  profile: FamilyProfile | null;
  riskLevel: RiskLevel;
  category: ScamCategory;
  sourceType: AlertSourceType;
  targetSummary: string;
  maskedReason: string;
  rawSnippet?: string;
  lang: LanguageCode;
}): CaregiverAlert {
  const now = new Date().toISOString();
  if (!params.profile) {
    return {
      id: `alt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: now,
      seniorName: '',
      caregiverName: '',
      caregiverPhone: '',
      riskLevel: params.riskLevel,
      category: params.category,
      sourceType: params.sourceType,
      targetSummary: params.targetSummary,
      maskedReason: params.maskedReason,
      rawSnippet: undefined,
      whatsappMessage: '',
      whatsappUrl: '',
      dispatchedViaWhatsApp: false,
    };
  }

  const { e164 } = normalizeIndianPhone(params.profile.caregiverPhone);
  const riskLabel = params.riskLevel === 'red' ? 'HIGH RISK' : params.riskLevel === 'yellow' ? 'CAUTION' : 'SAFE';

  const prefixByLang: Record<LanguageCode, string> = {
    en: `[CyberRakshak Alert] ${riskLabel}: ${params.profile.seniorName} encountered a suspicious ${params.sourceType}.`,
    hi: `[CyberRakshak अलर्ट] ${riskLabel}: ${params.profile.seniorName} ने एक संदिग्ध ${params.sourceType} खोला/जांचा।`,
    mr: `[CyberRakshak इशारा] ${riskLabel}: ${params.profile.seniorName} यांनी संशयास्पद ${params.sourceType} तपासला/उघडला.`,
    vrh: `[CyberRakshak अलर्ट] ${riskLabel}: ${params.profile.seniorName} यांनी संदिग्ध ${params.sourceType} उघडला हाये.`,
    gon: `[CyberRakshak अलर्ट] ${riskLabel}: ${params.profile.seniorName} संदिग्ध ${params.sourceType} जांच कयता.`,
  } as unknown as Record<LanguageCode, string>;

  // Clean concise text without leaking private raw SMS unless consent was explicitly granted
  const header =
    prefixByLang[params.lang] ||
    `[CyberRakshak Alert] ${riskLabel}: ${params.profile.seniorName} encountered a suspicious ${params.sourceType}.`;

  const lines = [
    header,
    `Target: ${params.targetSummary}`,
    `Reason: ${params.maskedReason}`,
  ];
  if (params.profile.privacyShareRawMessage && params.rawSnippet) {
    lines.push(`Shared snippet (with consent): ${params.rawSnippet.slice(0, 140)}`);
  } else {
    lines.push(`Privacy note: Full message hidden by senior privacy setting.`);
  }
  lines.push(`If unsure, call Cybercrime Helpline 1930 immediately.`);

  const whatsappMessage = lines.join('\n');
  const whatsappUrl = e164
    ? `https://wa.me/${e164}?text=${encodeURIComponent(whatsappMessage)}`
    : `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

  return {
    id: `alt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: now,
    seniorName: params.profile.seniorName,
    caregiverName: params.profile.caregiverName,
    caregiverPhone: params.profile.caregiverPhone,
    riskLevel: params.riskLevel,
    category: params.category,
    sourceType: params.sourceType,
    targetSummary: params.targetSummary,
    maskedReason: params.maskedReason,
    rawSnippet: params.profile.privacyShareRawMessage ? params.rawSnippet : undefined,
    whatsappMessage,
    whatsappUrl,
    dispatchedViaWhatsApp: Boolean(params.profile.permissions.whatsappAlerts),
  };
}

export interface StorageScanItem {
  id: string;
  source: 'storage' | 'messages' | 'whatsapp';
  itemName: string;
  riskLevel: RiskLevel;
  category: ScamCategory;
  summary: string;
}

export function scanDeviceWithPermissions(
  permissions: SafetyPermissions,
  lang: LanguageCode = 'en',
): { items: StorageScanItem[]; blockedModules: string[] } {
  const blockedModules: string[] = [];
  const items: StorageScanItem[] = [];

  if (permissions.storageScan) {
    items.push(
      {
        id: 'scan_apk_1',
        source: 'storage',
        itemName: 'SBI-KYC-Support-v4.apk',
        riskLevel: 'red',
        category: 'apk_malware',
        summary:
          lang === 'en'
            ? 'Unverified sideloaded APK in Downloads folder matching banking trojan pattern.'
            : analyzeThreatDeterministic('SBI-KYC-Support-v4.apk', lang).reasons[0],
      },
      {
        id: 'scan_apk_2',
        source: 'storage',
        itemName: 'AnyDesk Remote Desktop',
        riskLevel: 'yellow',
        category: 'apk_malware',
        summary:
          lang === 'en'
            ? 'Remote screen-sharing app installed; scammers use it to read bank OTPs.'
            : analyzeThreatDeterministic('anydesk', lang).reasons[0],
      },
    );
  } else {
    blockedModules.push('storage');
  }

  if (permissions.messagesScan) {
    items.push({
      id: 'scan_sms_1',
      source: 'messages',
      itemName: 'SMS: AD-MSEDCL — "Electricity power cut tonight 9PM pay bit.ly/mh-bill"',
      riskLevel: 'red',
      category: 'kyc',
      summary: analyzeThreatDeterministic('Electricity power cut today bit.ly/mh-bill', lang).reasons[0],
    });
  } else {
    blockedModules.push('messages');
  }

  if (permissions.whatsappAlerts) {
    items.push({
      id: 'scan_wa_1',
      source: 'whatsapp',
      itemName: 'WhatsApp Forward: "KBC ₹25 Lakh Winner claim-fee.xyz"',
      riskLevel: 'red',
      category: 'lottery',
      summary: analyzeThreatDeterministic('You won ₹25 lakh lottery claim-fee.xyz', lang).reasons[0],
    });
  } else {
    blockedModules.push('whatsapp');
  }

  return { items, blockedModules };
}
