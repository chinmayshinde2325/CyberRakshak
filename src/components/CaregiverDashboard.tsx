import { useState } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  HardDrive,
  Lock,
  ShieldAlert,
  UserCog,
} from 'lucide-react';
import { SCAM_GYM_SCENARIOS } from '../data/scamNews';
import type { CaregiverAlert, FamilyProfile, LanguageCode } from '../types/suraksha';
import type { TranslationStrings } from '../utils/i18n';
import { scanDeviceWithPermissions, type StorageScanItem } from '../utils/scamEngine';

interface CaregiverDashboardProps {
  t: TranslationStrings;
  lang: LanguageCode;
  profile: FamilyProfile | null;
  alerts: CaregiverAlert[];
  practicedIds: string[];
  onEditProfile: () => void;
  onTogglePrivacyShare: () => void;
}

export function CaregiverDashboard({
  t,
  lang,
  profile,
  alerts,
  practicedIds,
  onEditProfile,
  onTogglePrivacyShare,
}: CaregiverDashboardProps) {
  const c = t.caregiver;
  const [scanItems, setScanItems] = useState<StorageScanItem[] | null>(null);
  const [blockedModules, setBlockedModules] = useState<string[]>([]);

  if (!profile) {
    return (
      <section id="caregiver" className="bg-[#f2f3ef] py-14 text-[#23261f]">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <Lock className="mx-auto h-10 w-10 text-[#556343]" />
          <h2 className="mt-3 text-2xl font-semibold">{c.sectionTitle}</h2>
          <p className="mt-2 text-sm text-[#4f5448]">{t.onboarding.lockedNotice}</p>
          <button
            type="button"
            onClick={onEditProfile}
            className="mt-5 cursor-pointer rounded-xl bg-[#2f3c24] px-6 py-3 text-sm font-semibold text-white hover:bg-[#3f5031]"
          >
            {t.commandBar.setupProfileBtn}
          </button>
        </div>
      </section>
    );
  }

  const handleRunScan = () => {
    const res = scanDeviceWithPermissions(profile.permissions, lang);
    setScanItems(res.items);
    setBlockedModules(res.blockedModules);
  };

  return (
    <section id="caregiver" className="bg-[#f2f3ef] py-14 text-[#23261f] sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{c.sectionTitle}</h2>
            <p className="mt-2 text-base leading-relaxed text-[#4f5448]">{c.sectionSubtitle}</p>
          </div>
          <button
            type="button"
            onClick={onEditProfile}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#23261f]/20 bg-white px-4 py-2.5 text-sm font-semibold text-[#23261f] hover:bg-[#e7ebe2]"
          >
            <UserCog className="h-4 w-4" aria-hidden="true" />
            <span>{t.commandBar.editProfileBtn}</span>
          </button>
        </div>

        {/* Top Cards: Family Pair & Progress */}
        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          <div className="rounded-2xl border border-[#23261f]/12 bg-white p-6 lg:col-span-7">
            <h3 className="text-lg font-semibold">{c.familyCardTitle}</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-[#f9faf7] p-4">
                <p className="text-xs font-semibold text-[#5a6054] uppercase">{c.seniorLabel}</p>
                <p className="mt-1 text-base font-semibold text-[#23261f]">{profile.seniorName}</p>
                <p className="tabular-nums text-sm text-[#4f5448]">+91 {profile.seniorPhone}</p>
                {profile.seniorEmail && (
                  <p className="text-xs text-[#5a6054]">{profile.seniorEmail}</p>
                )}
              </div>
              <div className="rounded-xl bg-[#f9faf7] p-4">
                <p className="text-xs font-semibold text-[#5a6054] uppercase">{c.guardianLabel}</p>
                <p className="mt-1 text-base font-semibold text-[#23261f]">
                  {profile.caregiverName}
                </p>
                <p className="tabular-nums text-sm text-[#4f5448]">+91 {profile.caregiverPhone}</p>
                {profile.caregiverEmail && (
                  <p className="text-xs text-[#5a6054]">{profile.caregiverEmail}</p>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#23261f]/10 pt-4">
              <div className="text-xs text-[#4f5448]">
                <span className="font-semibold text-[#23261f]">{c.permissionsLabel}: </span>
                <span>
                  WhatsApp ({profile.permissions.whatsappAlerts ? 'ON' : 'OFF'}) · SMS (
                  {profile.permissions.messagesScan ? 'ON' : 'OFF'}) · Storage (
                  {profile.permissions.storageScan ? 'ON' : 'OFF'})
                </span>
              </div>

              <button
                type="button"
                onClick={onTogglePrivacyShare}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#23261f]/15 bg-[#f2f3ef] px-3 py-1.5 text-xs font-medium text-[#23261f] hover:bg-[#e5e8df]"
              >
                {profile.privacyShareRawMessage ? (
                  <Eye className="h-3.5 w-3.5" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5" />
                )}
                <span>{c.togglePrivacyBtn}</span>
              </button>
            </div>
            <p className="mt-2 text-xs text-[#556343]">
              {profile.privacyShareRawMessage ? c.privacySharedNotice : c.privacyMaskedNotice}
            </p>
          </div>

          <div className="rounded-2xl border border-[#23261f]/12 bg-[#272b23] p-6 text-white lg:col-span-5">
            <h3 className="text-lg font-semibold">{c.learningProgressTitle}</h3>
            <p className="tabular-nums mt-2 text-3xl font-bold text-[#93a476]">
              {practicedIds.length} / {SCAM_GYM_SCENARIOS.length}
            </p>
            <div className="mt-4 space-y-2.5">
              {SCAM_GYM_SCENARIOS.map((sc) => {
                const done = practicedIds.includes(sc.id);
                return (
                  <div
                    key={sc.id}
                    className="flex items-center justify-between rounded-lg bg-white/5 px-3.5 py-2 text-sm"
                  >
                    <span className="text-[#e8efe0]">{sc.title[lang]}</span>
                    <CheckCircle2
                      className={`h-4 w-4 ${done ? 'text-[#93a476]' : 'text-white/25'}`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Suspicious Activity & WhatsApp Alerts Feed */}
        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          <div className="rounded-2xl border border-[#23261f]/12 bg-white p-6 lg:col-span-7">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <ShieldAlert className="h-5 w-5 text-[#c63d2f]" aria-hidden="true" />
              <span>{c.alertsFeedTitle}</span>
            </h3>

            {alerts.length === 0 ? (
              <p className="mt-4 rounded-xl bg-[#f9faf7] p-4 text-sm text-[#4f5448]">
                {c.noAlertsYet}
              </p>
            ) : (
              <div className="mt-4 space-y-3" data-testid="caregiver-alerts-list">
                {alerts.map((alert) => (
                  <article
                    key={alert.id}
                    className="rounded-xl border border-[#c63d2f]/25 bg-[#fdf5f4] p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="tabular-nums text-xs font-medium text-[#7c352d]">
                        {new Date(alert.createdAt).toLocaleString()} · {alert.sourceType.toUpperCase()} ·{' '}
                        {alert.dispatchedViaWhatsApp ? c.statusDispatched : c.statusNeedsPermission}
                      </p>
                    </div>
                    <p className="mt-1.5 text-sm font-semibold text-[#23261f]">
                      {alert.targetSummary}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-[#4f5448]">
                      {alert.maskedReason}
                    </p>
                    {profile.privacyShareRawMessage && alert.rawSnippet && (
                      <p className="mt-2 rounded bg-white/80 p-2 text-xs text-[#3b4035]">
                        {alert.rawSnippet}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <a
                        href={alert.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#1d7a46] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#166137]"
                      >
                        <span>{c.sendWhatsappBtn}</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Device Storage / SMS / WhatsApp Scan */}
          <div className="rounded-2xl border border-[#23261f]/12 bg-white p-6 lg:col-span-5">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <HardDrive className="h-5 w-5 text-[#4a5d34]" aria-hidden="true" />
              <span>{c.deviceScanTitle}</span>
            </h3>

            <button
              type="button"
              data-testid="run-device-scan-btn"
              onClick={handleRunScan}
              className="mt-4 w-full cursor-pointer rounded-xl bg-[#2f3c24] px-4 py-3 text-sm font-semibold text-white hover:bg-[#3f5031]"
            >
              {c.runDeviceScanBtn}
            </button>

            {scanItems && (
              <div className="mt-4 space-y-2.5" data-testid="device-scan-results">
                {scanItems.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-xl border p-3 text-xs ${
                      item.riskLevel === 'red'
                        ? 'border-[#c63d2f]/30 bg-[#fdf5f4] text-[#6d1f17]'
                        : 'border-[#d98b26]/35 bg-[#fdf8ef] text-[#6d450a]'
                    }`}
                  >
                    <p className="font-semibold">
                      [{item.source.toUpperCase()}] {item.itemName}
                    </p>
                    <p className="mt-1 opacity-90">{item.summary}</p>
                  </div>
                ))}

                {blockedModules.length > 0 && (
                  <p className="rounded-lg bg-[#f2f3ef] p-3 text-xs text-[#4f5448]">
                    {blockedModules.join(', ').toUpperCase()}: {c.blockedPermissionNote}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
