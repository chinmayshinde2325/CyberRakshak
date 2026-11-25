import type {
  BuiltInFeatureModuleId,
  CustomFeatureCard,
  CustomHelplineItem,
  CustomNewsAlertInput,
  LanguageCode,
  ScamNewsItem,
  SiteUpdatesConfig,
  TrustedContactItem,
} from '../types/suraksha.ts';

export const DEFAULT_SITE_UPDATES: SiteUpdatesConfig = {
  enabledModules: {
    sos_card: false,
    daily_tip: false,
    trusted_contacts: false,
    pin_hygiene: false,
  },
  customFeatures: [],
  customNews: [],
  customTrustedDomains: [],
  customHelplines: [],
  trustedContacts: [],
  updatedAt: new Date(0).toISOString(),
};

export function sanitizeActionUrl(raw: string | undefined): string | undefined {
  const trimmed = (raw || '').trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith('#')) {
    return /^#[a-zA-Z0-9_-]{1,50}$/.test(trimmed) ? trimmed : undefined;
  }
  if (/^tel:[+\d\s-]{3,20}$/i.test(trimmed)) {
    return trimmed.replace(/\s+/g, '');
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString();
    }
  } catch {
    // Allow bare safe domains by normalizing to https:// if no scheme and valid domain syntax
    if (!trimmed.includes(':') && /^[a-z0-9.-]+\.[a-z]{2,24}(\/.*)?$/i.test(trimmed)) {
      try {
        return new URL(`https://${trimmed}`).toString();
      } catch {
        return undefined;
      }
    }
  }
  return undefined;
}

export function normalizeDomainEntry(raw: string): string | null {
  const trimmed = (raw || '').trim().toLowerCase();
  if (!trimmed) return null;
  let host = trimmed;
  try {
    if (/^[a-z]+:\/\//i.test(trimmed)) {
      host = new URL(trimmed).hostname.toLowerCase();
    } else {
      host = new URL(`https://${trimmed}`).hostname.toLowerCase();
    }
  } catch {
    return null;
  }
  host = host.replace(/^www\./, '');
  if (!/^[a-z0-9.-]+\.[a-z]{2,24}$/.test(host) || host.includes('..')) {
    return null;
  }
  return host;
}

function cleanStr(val: unknown, maxLen: number): string {
  return typeof val === 'string' ? val.trim().slice(0, maxLen) : '';
}

export function normalizeSiteUpdatesConfig(raw: unknown): SiteUpdatesConfig {
  const obj = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};
  const rawMods =
    typeof obj.enabledModules === 'object' && obj.enabledModules !== null
      ? (obj.enabledModules as Record<string, unknown>)
      : {};

  const enabledModules: Record<BuiltInFeatureModuleId, boolean> = {
    sos_card: Boolean(rawMods.sos_card),
    daily_tip: Boolean(rawMods.daily_tip),
    trusted_contacts: Boolean(rawMods.trusted_contacts),
    pin_hygiene: Boolean(rawMods.pin_hygiene),
  };

  const customFeatures: CustomFeatureCard[] = Array.isArray(obj.customFeatures)
    ? obj.customFeatures
        .slice(0, 20)
        .map((item): CustomFeatureCard | null => {
          if (typeof item !== 'object' || item === null) return null;
          const rec = item as Record<string, unknown>;
          const title = cleanStr(rec.title, 80);
          const description = cleanStr(rec.description, 260);
          if (!title || !description) return null;
          return {
            id: cleanStr(rec.id, 40) || `feat_${Date.now()}`,
            title,
            description,
            badge: cleanStr(rec.badge, 30) || 'Added Feature',
            actionLabel: cleanStr(rec.actionLabel, 40) || undefined,
            actionUrl: sanitizeActionUrl(cleanStr(rec.actionUrl, 240)),
            createdAt: cleanStr(rec.createdAt, 40) || new Date().toISOString(),
          };
        })
        .filter((x): x is CustomFeatureCard => x !== null)
    : [];

  const customNews: CustomNewsAlertInput[] = Array.isArray(obj.customNews)
    ? obj.customNews
        .slice(0, 20)
        .map((item): CustomNewsAlertInput | null => {
          if (typeof item !== 'object' || item === null) return null;
          const rec = item as Record<string, unknown>;
          const title = cleanStr(rec.title, 140);
          const summary = cleanStr(rec.summary, 360);
          if (!title || !summary) return null;
          const cat = rec.category;
          const category: ScamNewsItem['category'] =
            cat === 'digital_arrest' || cat === 'otp_pension' ? cat : 'kyc_apk';
          return {
            id: cleanStr(rec.id, 40) || `cnews_${Date.now()}`,
            date: cleanStr(rec.date, 20) || new Date().toISOString().slice(0, 10),
            category,
            region: cleanStr(rec.region, 60) || 'Community Update',
            source: cleanStr(rec.source, 60) || 'Added via Site Studio',
            title,
            summary,
            takeaway: cleanStr(rec.takeaway, 180) || 'Verify before clicking links or sharing OTPs.',
          };
        })
        .filter((x): x is CustomNewsAlertInput => x !== null)
    : [];

  const customTrustedDomains: string[] = Array.isArray(obj.customTrustedDomains)
    ? Array.from(
        new Set(
          obj.customTrustedDomains
            .slice(0, 30)
            .map((d) => normalizeDomainEntry(String(d || '')))
            .filter((d): d is string => Boolean(d)),
        ),
      )
    : [];

  const customHelplines: CustomHelplineItem[] = Array.isArray(obj.customHelplines)
    ? obj.customHelplines
        .slice(0, 20)
        .map((item): CustomHelplineItem | null => {
          if (typeof item !== 'object' || item === null) return null;
          const rec = item as Record<string, unknown>;
          const name = cleanStr(rec.name, 80);
          const number = cleanStr(rec.number, 32);
          if (!name || !number) return null;
          return {
            id: cleanStr(rec.id, 40) || `help_${Date.now()}`,
            name,
            number,
            note: cleanStr(rec.note, 80) || 'Custom Helpline',
          };
        })
        .filter((x): x is CustomHelplineItem => x !== null)
    : [];

  const trustedContacts: TrustedContactItem[] = Array.isArray(obj.trustedContacts)
    ? obj.trustedContacts
        .slice(0, 15)
        .map((item): TrustedContactItem | null => {
          if (typeof item !== 'object' || item === null) return null;
          const rec = item as Record<string, unknown>;
          const name = cleanStr(rec.name, 60);
          const phone = cleanStr(rec.phone, 20).replace(/[^+\d\s-]/g, '');
          if (!name || !phone) return null;
          return {
            id: cleanStr(rec.id, 40) || `cnt_${Date.now()}`,
            name,
            relation: cleanStr(rec.relation, 40) || 'Family / Doctor',
            phone,
          };
        })
        .filter((x): x is TrustedContactItem => x !== null)
    : [];

  return {
    enabledModules,
    customFeatures,
    customNews,
    customTrustedDomains,
    customHelplines,
    trustedContacts,
    updatedAt: cleanStr(obj.updatedAt, 40) || new Date().toISOString(),
  };
}

export function toLocalizedCustomNewsItem(item: CustomNewsAlertInput): ScamNewsItem {
  const fillAll = (text: string): Record<LanguageCode, string> => ({
    en: text,
    hi: text,
    mr: text,
    vrh: text,
    gon: text,
  });

  return {
    id: item.id,
    date: item.date,
    category: item.category,
    region: item.region,
    source: item.source,
    practiceScenarioId:
      item.category === 'digital_arrest'
        ? 'digital_arrest'
        : item.category === 'otp_pension'
          ? 'otp'
          : 'kyc',
    title: fillAll(item.title),
    summary: fillAll(item.summary),
    takeaway: fillAll(item.takeaway),
  };
}

export const DAILY_SAFETY_TIPS: Record<LanguageCode, string[]> = {
  en: [
    'Never share any 4-digit or 6-digit OTP on a phone call — even if the caller sounds polite or urgent.',
    'There is no "Digital Arrest" under Indian law. Hang up immediately on threatening video calls.',
    'Always type your bank or official website directly or check suspicious links here before opening them.',
  ],
  hi: [
    'किसी भी फोन कॉल पर कभी 4 या 6 अंकों का OTP न बताएं — चाहे कॉल करने वाला कितनी भी जल्दी दिखाए।',
    'भारतीय कानून में "डिजिटल अरेस्ट" नहीं होता। धमकी भरे वीडियो कॉल तुरंत काट दें।',
    'किसी भी अनजान लिंक को खोलने से पहले यहाँ सुरक्षा जांच जरूर करें।',
  ],
  mr: [
    'फोन कॉलवर कधीही ४ किंवा ६ अंकी OTP सांगू नका — समोरची व्यक्ती कितीही घाई करत असली तरी.',
    'भारतीय कायद्यात "डिजिटल अरेस्ट" नसते. धमकीचे व्हिडिओ कॉल तात्काळ कट करा.',
    'कोणतीही संशयास्पद लिंक उघडण्यापूर्वी येथे सुरक्षा तपासणी करून पाहा.',
  ],
  vrh: [
    'कोनत्याबी फोनवर कधीबी OTP सांगू नका — समोरचा कितीबी घाई दाखवत असन तरी.',
    'भारतात "डिजिटल अरेस्ट" असा कायदाच नाय. धमकीचा व्हिडिओ कॉल लगेच कापा.',
    'कोनतीबी अनोळखी लिंक दाबन्याआधी इथं तपासून घ्या जी.',
  ],
  gon: [
    'कोणता बी फोनवर कदी बी OTP वेहना आयो — समोरचा किती बी घाई कयता तरी.',
    'भारत कानून ते "डिजिटल अरेस्ट" आयो. धमकीचा व्हिडिओ कॉल तात्काळ बंद कयका.',
    'कोणती बी अनोळखी लिंक उघडना अगाडी इथं तपासून हुडा.',
  ],
};
