import { useState } from 'react';
import {
  CheckSquare,
  ExternalLink,
  Lightbulb,
  PhoneCall,
  PlusCircle,
  ShieldAlert,
  Sparkles,
  Square,
  Trash2,
  UserPlus,
} from 'lucide-react';
import type {
  FamilyProfile,
  LanguageCode,
  SiteUpdatesConfig,
  TrustedContactItem,
} from '../types/suraksha';
import type { TranslationStrings } from '../utils/i18n';
import { DAILY_SAFETY_TIPS, sanitizeActionUrl } from '../utils/siteUpdates';

interface AddedFeaturesSectionProps {
  t: TranslationStrings;
  lang: LanguageCode;
  config: SiteUpdatesConfig;
  profile: FamilyProfile | null;
  onUpdateConfig: (next: SiteUpdatesConfig) => void;
  onOpenStudio: () => void;
}

const HYGIENE_ITEMS = [
  'Never share OTP or UPI PIN with anyone calling as bank/police',
  'Enable SIM Lock & UPI app screen lock on phone',
  'Verify unknown SMS/WhatsApp links before clicking',
  'Keep 1930 Cyber Helpline & caregiver saved on speed dial',
];

export function AddedFeaturesSection({
  t,
  lang,
  config,
  profile,
  onUpdateConfig,
  onOpenStudio,
}: AddedFeaturesSectionProps) {
  const [tipIndex, setTipIndex] = useState(0);
  const [checkedHygiene, setCheckedHygiene] = useState<number[]>([0]);
  const [contactName, setContactName] = useState('');
  const [contactRel, setContactRel] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const { enabledModules, customFeatures, trustedContacts } = config;
  const anyModuleEnabled = Object.values(enabledModules).some(Boolean);

  if (!anyModuleEnabled && customFeatures.length === 0) {
    return null;
  }

  const su = t.siteUpdates;
  const tips = DAILY_SAFETY_TIPS[lang] || DAILY_SAFETY_TIPS.en;
  const activeTip = tips[tipIndex % tips.length];

  const sosWhatsappHref = profile?.caregiverPhone
    ? `https://wa.me/91${profile.caregiverPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
        `SOS Help Needed: ${profile.seniorName} pressed the Emergency Safety button on CyberRakshak. Please call immediately.`,
      )}`
    : undefined;

  const handleAddContact = () => {
    const cleanName = contactName.trim();
    const cleanPhone = contactPhone.replace(/[^+\d\s-]/g, '').trim();
    if (!cleanName || cleanPhone.length < 6) return;
    const item: TrustedContactItem = {
      id: `cnt_${Date.now()}`,
      name: cleanName.slice(0, 60),
      relation: (contactRel.trim() || 'Family').slice(0, 40),
      phone: cleanPhone.slice(0, 20),
    };
    onUpdateConfig({
      ...config,
      trustedContacts: [...trustedContacts, item],
      updatedAt: new Date().toISOString(),
    });
    setContactName('');
    setContactRel('');
    setContactPhone('');
  };

  const handleDeleteContact = (id: string) => {
    onUpdateConfig({
      ...config,
      trustedContacts: trustedContacts.filter((c) => c.id !== id),
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <section
      id="added-features"
      data-testid="added-features-section"
      className="border-t border-white/10 bg-[#101c2b] py-12 text-[#f1f5f9] sm:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-wider text-[#38bdf8] uppercase">
              CyberRakshak Studio
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {su.sectionHeading}
            </h2>
            <p className="mt-1 text-sm text-[#cbd5e1]">{su.sectionSubheading}</p>
          </div>

          <button
            type="button"
            onClick={onOpenStudio}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#38bdf8]/35 bg-[#152437] px-4 py-2 text-xs font-semibold text-[#e0f2fe] hover:bg-[#1b3048]"
          >
            <PlusCircle className="h-4 w-4 text-[#38bdf8]" aria-hidden="true" />
            <span>{su.openStudioBtn}</span>
          </button>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* Module 1: Emergency SOS Quick Card */}
          {enabledModules.sos_card && (
            <div
              data-testid="module-sos-card"
              className="rounded-2xl border border-[#c63d2f]/40 bg-[#1c1317] p-6"
            >
              <div className="flex items-center gap-2 text-[#fca5a5]">
                <ShieldAlert className="h-5 w-5" aria-hidden="true" />
                <h3 className="text-lg font-semibold text-white">{su.modSosTitle}</h3>
              </div>
              <p className="mt-1.5 text-sm text-[#e2e8f0]">{su.modSosDesc}</p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <a
                  href="tel:1930"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#c63d2f] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#a82e22]"
                >
                  <PhoneCall className="h-4 w-4" aria-hidden="true" />
                  <span>1930 Helpline</span>
                </a>
                <a
                  href="https://cybercrime.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/10"
                >
                  <span>cybercrime.gov.in</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                {sosWhatsappHref && (
                  <a
                    href={sosWhatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#1d7a46] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#166137]"
                  >
                    <span>WhatsApp {profile?.caregiverName}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Module 2: Daily Safety Tip Banner */}
          {enabledModules.daily_tip && (
            <div
              data-testid="module-daily-tip"
              className="rounded-2xl border border-[#38bdf8]/30 bg-[#142334] p-6"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[#38bdf8]">
                  <Lightbulb className="h-5 w-5" aria-hidden="true" />
                  <h3 className="text-lg font-semibold text-white">{su.modTipTitle}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setTipIndex((i) => i + 1)}
                  className="cursor-pointer rounded-lg border border-white/15 px-2.5 py-1 text-xs text-[#cbd5e1] hover:bg-white/10"
                >
                  Next Tip
                </button>
              </div>
              <p className="mt-3 text-base font-medium leading-relaxed text-[#e0f2fe]">
                {activeTip}
              </p>
            </div>
          )}

          {/* Module 3: Trusted Contacts Quick-Dial Book */}
          {enabledModules.trusted_contacts && (
            <div
              data-testid="module-trusted-contacts"
              className="rounded-2xl border border-white/15 bg-[#162231] p-6"
            >
              <div className="flex items-center gap-2 text-[#38bdf8]">
                <UserPlus className="h-5 w-5" aria-hidden="true" />
                <h3 className="text-lg font-semibold text-white">{su.modContactsTitle}</h3>
              </div>
              <p className="mt-1 text-xs text-[#cbd5e1]">{su.modContactsDesc}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Name (e.g., Dr. Kulkarni)"
                  className="min-w-[130px] flex-1 rounded-lg border border-white/15 bg-[#0d1724] px-2.5 py-1.5 text-xs text-white focus:border-[#38bdf8] focus:outline-none"
                />
                <input
                  type="text"
                  value={contactRel}
                  onChange={(e) => setContactRel(e.target.value)}
                  placeholder="Relation"
                  className="w-24 rounded-lg border border-white/15 bg-[#0d1724] px-2.5 py-1.5 text-xs text-white focus:border-[#38bdf8] focus:outline-none"
                />
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="Phone"
                  className="w-28 rounded-lg border border-white/15 bg-[#0d1724] px-2.5 py-1.5 text-xs text-white focus:border-[#38bdf8] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddContact}
                  className="cursor-pointer rounded-lg bg-[#38bdf8] px-3 py-1.5 text-xs font-semibold text-[#08121c] hover:bg-[#5cccfb]"
                >
                  Add
                </button>
              </div>

              <div className="mt-3 space-y-2">
                {trustedContacts.length === 0 ? (
                  <p className="text-xs text-[#94a3b8]">No custom contacts saved yet.</p>
                ) : (
                  trustedContacts.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-[#0d1724] px-3 py-2 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-white">{c.name}</span>
                        <span className="ml-2 text-[#94a3b8]">({c.relation})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${c.phone.replace(/\s+/g, '')}`}
                          className="inline-flex items-center gap-1 rounded bg-[#1d7a46] px-2.5 py-1 font-semibold text-white hover:bg-[#166137]"
                        >
                          <PhoneCall className="h-3 w-3" />
                          <span>{c.phone}</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDeleteContact(c.id)}
                          aria-label={`Remove ${c.name}`}
                          className="cursor-pointer rounded p-1 text-[#94a3b8] hover:text-white"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Module 4: PIN & UPI Hygiene Self-Check */}
          {enabledModules.pin_hygiene && (
            <div
              data-testid="module-pin-hygiene"
              className="rounded-2xl border border-white/15 bg-[#162231] p-6"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-semibold text-white">{su.modPinTitle}</h3>
                <span className="tabular-nums text-xs font-semibold text-[#38bdf8]">
                  {checkedHygiene.length} / {HYGIENE_ITEMS.length}
                </span>
              </div>
              <p className="mt-1 text-xs text-[#cbd5e1]">{su.modPinDesc}</p>
              <div className="mt-3 space-y-2">
                {HYGIENE_ITEMS.map((item, idx) => {
                  const isChecked = checkedHygiene.includes(idx);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() =>
                        setCheckedHygiene((prev) =>
                          prev.includes(idx) ? prev.filter((x) => x !== idx) : [...prev, idx],
                        )
                      }
                      className="flex w-full cursor-pointer items-start gap-2.5 rounded-lg border border-white/10 bg-[#0d1724] p-2.5 text-left text-xs text-[#e2e8f0] hover:border-[#38bdf8]/40"
                    >
                      {isChecked ? (
                        <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-[#4ade80]" />
                      ) : (
                        <Square className="mt-0.5 h-4 w-4 shrink-0 text-[#94a3b8]" />
                      )}
                      <span>{item}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* User-Added Custom Feature Cards */}
          {customFeatures.map((feat) => {
            const safeUrl = sanitizeActionUrl(feat.actionUrl);
            const isExternal = safeUrl?.startsWith('http');
            return (
              <div
                key={feat.id}
                data-testid={`custom-feature-${feat.id}`}
                className="flex flex-col justify-between rounded-2xl border border-[#38bdf8]/25 bg-[#162231] p-6"
              >
                <div>
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#38bdf8]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#7dd3fc]">
                    <Sparkles className="h-3 w-3" aria-hidden="true" />
                    <span>{feat.badge}</span>
                  </span>
                  <h3 className="mt-2.5 text-lg font-semibold text-white">{feat.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#cbd5e1]">
                    {feat.description}
                  </p>
                </div>

                {safeUrl && feat.actionLabel && (
                  <div className="mt-4">
                    <a
                      href={safeUrl}
                      target={isExternal ? '_blank' : undefined}
                      rel={isExternal ? 'noopener noreferrer' : undefined}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#38bdf8] px-4 py-2 text-xs font-semibold text-[#08121c] hover:bg-[#5cccfb]"
                    >
                      <span>{feat.actionLabel}</span>
                      {isExternal && <ExternalLink className="h-3.5 w-3.5" />}
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
