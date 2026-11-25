import { useCallback, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { AddedFeaturesSection } from './components/AddedFeaturesSection';
import { CaregiverDashboard } from './components/CaregiverDashboard';
import { CommandBar } from './components/CommandBar';
import { DangerWarningModal } from './components/DangerWarningModal';
import { HeroSection } from './components/HeroSection';
import { NewsSection } from './components/NewsSection';
import { OnboardingGate } from './components/OnboardingGate';
import { ProtectSection } from './components/ProtectSection';
import { ScamGymSection } from './components/ScamGymSection';
import { SeniorHub } from './components/SeniorHub';
import { SiteUpdateStudio } from './components/SiteUpdateStudio';
import { StatsAndFunnelSection } from './components/StatsAndFunnelSection';
import { VoiceAssistant } from './components/VoiceAssistant';
import type {
  AlertSourceType,
  AppMode,
  CaregiverAlert,
  FamilyProfile,
  LanguageCode,
  RiskLevel,
  SandboxLinkItem,
  ScamCategory,
  ScamGymScenario,
  SiteUpdatesConfig,
} from './types/suraksha';
import { LANGUAGES, TRANSLATIONS } from './utils/i18n';
import { analyzeThreatDeterministic, buildWhatsAppAlertPayload } from './utils/scamEngine';
import { DEFAULT_SITE_UPDATES, normalizeSiteUpdatesConfig } from './utils/siteUpdates';
import { unlockAudioPlayback } from './utils/speechPlayer';

const PROFILE_STORAGE_KEY = 'surakshasathi_family_profile_v1';
const ALERTS_STORAGE_KEY = 'surakshasathi_alerts_v1';
const PROGRESS_STORAGE_KEY = 'surakshasathi_progress_v1';
const SITE_UPDATES_STORAGE_KEY = 'surakshasathi_site_updates_v1';

export default function App() {
  const [lang, setLang] = useState<LanguageCode>('en');
  const [mode, setMode] = useState<AppMode>('senior');
  const [profile, setProfile] = useState<FamilyProfile | null>(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('autostart') === '1') {
          return {
            seniorName: 'Madhavrao Deshmukh',
            seniorPhone: '9823011223',
            caregiverName: 'Sneha Deshmukh',
            caregiverPhone: '9823099887',
            caregiverEmail: 'sneha@example.com',
            permissions: { whatsappAlerts: true, messagesScan: true, storageScan: true },
            privacyShareRawMessage: false,
            completedAt: new Date().toISOString(),
          };
        }
        const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
        return raw ? (JSON.parse(raw) as FamilyProfile) : null;
      }
    } catch {
      return null;
    }
    return null;
  });

  const [alerts, setAlerts] = useState<CaregiverAlert[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const raw = window.localStorage.getItem(ALERTS_STORAGE_KEY);
        return raw ? (JSON.parse(raw) as CaregiverAlert[]) : [];
      }
    } catch {
      return [];
    }
    return [];
  });

  const [practicedIds, setPracticedIds] = useState<string[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
        return raw ? (JSON.parse(raw) as string[]) : ['kyc'];
      }
    } catch {
      return ['kyc'];
    }
    return ['kyc'];
  });

  const [setupModalOpen, setSetupModalOpen] = useState<boolean>(false);
  const [siteStudioOpen, setSiteStudioOpen] = useState<boolean>(false);
  const [bannerDismissed, setBannerDismissed] = useState<boolean>(false);
  const [assistantOpen, setAssistantOpen] = useState<boolean>(false);
  const [queuedTopic, setQueuedTopic] = useState<string | null>(null);
  const [selectedScenarioId, setSelectedScenarioId] = useState<ScamGymScenario['id']>('kyc');
  const [activeDangerModal, setActiveDangerModal] = useState<CaregiverAlert | null>(null);

  const [siteUpdates, setSiteUpdates] = useState<SiteUpdatesConfig>(() => {
    try {
      if (typeof window !== 'undefined') {
        const raw = window.localStorage.getItem(SITE_UPDATES_STORAGE_KEY);
        if (raw) return normalizeSiteUpdatesConfig(JSON.parse(raw));
      }
    } catch {}
    return { ...DEFAULT_SITE_UPDATES };
  });

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  useEffect(() => {
    document.documentElement.lang = lang === 'vrh' || lang === 'gon' ? 'mr' : lang;
  }, [lang]);

  // Sync server caregiver alert history and persisted site updates
  useEffect(() => {
    fetch('/api/alerts/caregiver')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.alerts && Array.isArray(data.alerts) && data.alerts.length > 0) {
          setAlerts((prev) => {
            const seen = new Set(prev.map((a) => a.id));
            const merged = [...prev];
            for (const item of data.alerts) {
              if (!seen.has(item.id)) merged.push(item);
            }
            return merged.slice(0, 30);
          });
        }
      })
      .catch(() => {});

    fetch('/api/site-updates')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.config) {
          const serverCfg = normalizeSiteUpdatesConfig(data.config);
          setSiteUpdates((prev) => {
            // Keep whichever has newer updates or merge if local is fresh default
            const hasLocalData =
              Object.values(prev.enabledModules).some(Boolean) ||
              prev.customFeatures.length > 0 ||
              prev.customNews.length > 0 ||
              prev.customTrustedDomains.length > 0 ||
              prev.customHelplines.length > 0;
            return hasLocalData && prev.updatedAt > serverCfg.updatedAt ? prev : serverCfg;
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveSiteUpdates = async (nextConfig: SiteUpdatesConfig) => {
    const normalized = normalizeSiteUpdatesConfig(nextConfig);
    setSiteUpdates(normalized);
    try {
      window.localStorage.setItem(SITE_UPDATES_STORAGE_KEY, JSON.stringify(normalized));
    } catch {}
    try {
      await fetch('/api/site-updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: normalized }),
      });
    } catch {
      // Kept in localStorage even if offline
    }
  };

  const handleSaveProfile = (newProfile: FamilyProfile) => {
    setProfile(newProfile);
    setSetupModalOpen(false);
    try {
      window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(newProfile));
    } catch {}
  };

  const handleTogglePrivacyShare = () => {
    if (!profile) return;
    const updated: FamilyProfile = {
      ...profile,
      privacyShareRawMessage: !profile.privacyShareRawMessage,
    };
    handleSaveProfile(updated);
  };

  const handleDispatchCaregiverAlert = useCallback(
    async (params: {
      riskLevel: RiskLevel;
      category: ScamCategory;
      sourceType: AlertSourceType;
      targetSummary: string;
      maskedReason: string;
      rawSnippet?: string;
    }): Promise<CaregiverAlert | null> => {
      if (!profile) {
        return buildWhatsAppAlertPayload({
          profile: null,
          lang,
          ...params,
        });
      }

      let createdAlert: CaregiverAlert | null = null;
      try {
        const resp = await fetch('/api/alerts/caregiver', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profile,
            language: lang,
            ...params,
          }),
        });
        if (resp.ok) {
          const data = await resp.json();
          createdAlert = data.alert as CaregiverAlert;
        }
      } catch {
        // Construct locally if offline
      }

      if (!createdAlert) {
        createdAlert = buildWhatsAppAlertPayload({
          profile,
          lang,
          ...params,
        });
      }

      setAlerts((prev) => {
        const next = [createdAlert!, ...prev].slice(0, 30);
        try {
          window.localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });

      return createdAlert;
    },
    [lang, profile],
  );

  const handleSandboxThreatTriggered = async (item: SandboxLinkItem) => {
    const analysis = analyzeThreatDeterministic(item.urlOrApp, lang);
    const alert = await handleDispatchCaregiverAlert({
      riskLevel: 'red',
      category: analysis.category,
      sourceType: item.sourceType,
      targetSummary: item.urlOrApp,
      maskedReason: analysis.reasons[0] || item.description[lang],
      rawSnippet: item.urlOrApp,
    });
    if (alert) {
      setActiveDangerModal(alert);
    }
  };

  const handleNavigateSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleScenarioPracticed = (id: string) => {
    setPracticedIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#0d1724] text-[#f1f5f9]">
      {/* Interactive 3D Cybersecurity Defense Hero with Floating Language / Sign In / Ask Saathi */}
      <HeroSection
        lang={lang}
        t={t}
        profile={profile}
        onChangeLang={setLang}
        onOpenSetup={() => setSetupModalOpen(true)}
        onNavigateSection={handleNavigateSection}
        onOpenVoiceAssistant={() => {
          unlockAudioPlayback();
          setAssistantOpen(true);
        }}
        onSwitchToCaregiver={() => {
          setMode('caregiver');
          handleNavigateSection('caregiver');
        }}
      />

      {/* Sticky Workspace Bar: Mode Switcher, 5 Regional Languages, Site Updates, Family Setup, 1930 & Voice */}
      <CommandBar
        t={t}
        lang={lang}
        mode={mode}
        profile={profile}
        onChangeLang={setLang}
        onChangeMode={setMode}
        onOpenSetup={() => setSetupModalOpen(true)}
        onOpenAssistant={() => {
          unlockAudioPlayback();
          setAssistantOpen(true);
        }}
        onOpenSiteUpdates={() => setSiteStudioOpen(true)}
        onNavigateSection={handleNavigateSection}
      />

      {/* Optional Gentle Tip Banner when Family Profile hasn't been linked yet */}
      {!profile && !bannerDismissed && (
        <div
          data-testid="optional-setup-banner"
          className="relative border-b border-[#38bdf8]/25 bg-[#122031] px-10 py-2.5 text-center text-xs text-[#dbeafe] sm:text-sm"
        >
          <span>{t.onboarding.lockedNotice} </span>
          <button
            type="button"
            onClick={() => setSetupModalOpen(true)}
            className="ml-2 cursor-pointer font-semibold text-[#38bdf8] underline hover:text-white"
          >
            {t.commandBar.setupProfileBtn}
          </button>
          <button
            type="button"
            onClick={() => setBannerDismissed(true)}
            aria-label="Dismiss tip"
            className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer rounded p-1 text-[#94a3b8] hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Senior Citizen Simplified Hub vs Caregiver Guardian Dashboard */}
      {mode === 'senior' ? (
        <SeniorHub
          t={t}
          profile={profile}
          onNavigateSection={handleNavigateSection}
          onOpenAssistant={() => {
            unlockAudioPlayback();
            setAssistantOpen(true);
          }}
        />
      ) : (
        <CaregiverDashboard
          t={t}
          lang={lang}
          profile={profile}
          alerts={alerts}
          practicedIds={practicedIds}
          onEditProfile={() => setSetupModalOpen(true)}
          onTogglePrivacyShare={handleTogglePrivacyShare}
        />
      )}

      {/* Protect: "Is This Safe?" Analyzer + 1930 Helpline Directory */}
      <ProtectSection
        t={t}
        lang={lang}
        largeText={mode === 'senior'}
        customTrustedDomains={siteUpdates.customTrustedDomains}
        customHelplines={siteUpdates.customHelplines}
        onRequireSetup={() => setSetupModalOpen(true)}
        onDispatchCaregiverAlert={handleDispatchCaregiverAlert}
      />

      {/* Practice: Scam Gym + Mock Banking & Safe-Browsing Sandbox */}
      <ScamGymSection
        t={t}
        lang={lang}
        largeText={mode === 'senior'}
        selectedScenarioId={selectedScenarioId}
        practicedIds={practicedIds}
        onSelectScenario={setSelectedScenarioId}
        onScenarioPracticed={handleScenarioPracticed}
        onSandboxThreatTriggered={handleSandboxThreatTriggered}
      />

      {/* Dedicated Recent Senior Citizen Scam News Section */}
      <NewsSection
        t={t}
        lang={lang}
        largeText={mode === 'senior'}
        customNews={siteUpdates.customNews}
        onPracticeScenario={(scenarioId) => {
          setSelectedScenarioId(scenarioId);
          handleNavigateSection('scam-gym');
        }}
        onAskAssistantTopic={(topic) => {
          unlockAudioPlayback();
          setQueuedTopic(topic);
          setAssistantOpen(true);
        }}
      />

      {/* Live Website Updates & Modular Added Features (Shown when user enables or adds features) */}
      <AddedFeaturesSection
        t={t}
        lang={lang}
        config={siteUpdates}
        profile={profile}
        onUpdateConfig={(next) => void handleSaveSiteUpdates(next)}
        onOpenStudio={() => setSiteStudioOpen(true)}
      />

      {/* Crisis Metrics, 4-Stage Scam Funnel & Solution Comparison */}
      <StatsAndFunnelSection t={t} />

      {/* In Senior Mode, still expose Caregiver link at bottom so switching is effortless */}
      {mode === 'senior' && (
        <section id="caregiver" className="border-t border-white/10 bg-[#101c2b] py-8 text-center">
          <p className="text-sm text-[#cbd5e1]">{t.caregiver.sectionSubtitle}</p>
          <button
            type="button"
            onClick={() => {
              setMode('caregiver');
              handleNavigateSection('workspace');
            }}
            className="mt-3 cursor-pointer rounded-xl bg-[#dd8940] px-5 py-2.5 text-sm font-semibold text-[#1c1f19] hover:bg-[#e79750]"
          >
            {t.commandBar.caregiverMode}
          </button>
        </section>
      )}

      {/* Quiet Footer */}
      <footer className="border-t border-white/10 bg-[#091019] py-10 text-center text-[#cbd5e1]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <p className="text-base font-medium text-white">{t.footer.manifesto}</p>
          <p className="mt-3 text-xs text-[#94a3b8]">{t.footer.hackathonCredit}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs">
            {LANGUAGES.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => setLang(item.code)}
                className={`cursor-pointer ${
                  lang === item.code ? 'font-semibold text-[#38bdf8] underline' : 'hover:text-white'
                }`}
              >
                {item.nativeLabel}
              </button>
            ))}
          </div>
        </div>
      </footer>

      {/* Optional Onboarding & Permissions Modal (Always Closable via X) */}
      <OnboardingGate
        open={setupModalOpen}
        existingProfile={profile}
        t={t}
        onComplete={handleSaveProfile}
        onClose={() => setSetupModalOpen(false)}
      />

      {/* Suspicious Activity Blocked + Optional Caregiver WhatsApp Alert Modal */}
      <DangerWarningModal
        alert={activeDangerModal}
        t={t}
        onDismiss={() => setActiveDangerModal(null)}
        onOpenSetup={() => setSetupModalOpen(true)}
      />

      {/* Working Multi-Language AI Voice & Chat Assistant (Available Immediately) */}
      <VoiceAssistant
        open={assistantOpen}
        t={t}
        lang={lang}
        mode={mode}
        profile={profile}
        queuedTopic={queuedTopic}
        onClearQueuedTopic={() => setQueuedTopic(null)}
        onOpen={() => setAssistantOpen(true)}
        onClose={() => setAssistantOpen(false)}
      />

      {/* Website Update & Add Features Studio Modal */}
      <SiteUpdateStudio
        open={siteStudioOpen}
        t={t}
        config={siteUpdates}
        onSaveConfig={handleSaveSiteUpdates}
        onClose={() => setSiteStudioOpen(false)}
      />
    </div>
  );
}
