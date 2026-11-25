export type LanguageCode = 'en' | 'hi' | 'mr' | 'vrh' | 'gon';

export type AppMode = 'senior' | 'caregiver';

export type RiskLevel = 'green' | 'yellow' | 'red';

export type ScamCategory =
  | 'kyc'
  | 'otp'
  | 'digital_arrest'
  | 'lottery'
  | 'apk_malware'
  | 'safe'
  | 'unknown';

export interface SafetyPermissions {
  whatsappAlerts: boolean;
  messagesScan: boolean;
  storageScan: boolean;
}

export interface FamilyProfile {
  seniorName: string;
  seniorPhone: string;
  seniorEmail?: string;
  caregiverName: string;
  caregiverPhone: string;
  caregiverEmail?: string;
  permissions: SafetyPermissions;
  privacyShareRawMessage: boolean;
  completedAt: string;
}

export type AlertSourceType = 'website' | 'app' | 'sms' | 'call';

export interface CaregiverAlert {
  id: string;
  createdAt: string;
  seniorName: string;
  caregiverName: string;
  caregiverPhone: string;
  riskLevel: RiskLevel;
  category: ScamCategory;
  sourceType: AlertSourceType;
  targetSummary: string;
  maskedReason: string;
  rawSnippet?: string;
  whatsappMessage: string;
  whatsappUrl: string;
  dispatchedViaWhatsApp: boolean;
}

export interface ThreatAnalysisResult {
  riskLevel: RiskLevel;
  score: number;
  category: ScamCategory;
  detectedFlags: string[];
  reasons: string[];
  nextSteps: string[];
  shouldNotifyCaregiver: boolean;
  aiExplanation?: string;
}

export interface ScamNewsItem {
  id: string;
  date: string;
  category: 'digital_arrest' | 'kyc_apk' | 'otp_pension';
  region: string;
  source: string;
  practiceScenarioId: 'digital_arrest' | 'kyc' | 'otp' | 'lottery';
  title: Record<LanguageCode, string>;
  summary: Record<LanguageCode, string>;
  takeaway: Record<LanguageCode, string>;
}

export interface SandboxLinkItem {
  id: string;
  urlOrApp: string;
  sourceType: AlertSourceType;
  expectedRisk: RiskLevel;
  label: Record<LanguageCode, string>;
  description: Record<LanguageCode, string>;
}

export interface ScamGymScenario {
  id: 'kyc' | 'otp' | 'digital_arrest' | 'lottery';
  title: Record<LanguageCode, string>;
  callerLabel: Record<LanguageCode, string>;
  openingLine: Record<LanguageCode, string>;
  redFlags: Record<LanguageCode, string[]>;
  safeReplyTip: Record<LanguageCode, string>;
}

export type BuiltInFeatureModuleId =
  | 'sos_card'
  | 'daily_tip'
  | 'trusted_contacts'
  | 'pin_hygiene';

export interface CustomFeatureCard {
  id: string;
  title: string;
  description: string;
  badge: string;
  actionLabel?: string;
  actionUrl?: string;
  createdAt: string;
}

export interface CustomNewsAlertInput {
  id: string;
  date: string;
  category: ScamNewsItem['category'];
  region: string;
  source: string;
  title: string;
  summary: string;
  takeaway: string;
}

export interface CustomHelplineItem {
  id: string;
  name: string;
  number: string;
  note: string;
}

export interface TrustedContactItem {
  id: string;
  name: string;
  relation: string;
  phone: string;
}

export interface SiteUpdatesConfig {
  enabledModules: Record<BuiltInFeatureModuleId, boolean>;
  customFeatures: CustomFeatureCard[];
  customNews: CustomNewsAlertInput[];
  customTrustedDomains: string[];
  customHelplines: CustomHelplineItem[];
  trustedContacts: TrustedContactItem[];
  updatedAt: string;
}
