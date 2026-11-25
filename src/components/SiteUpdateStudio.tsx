import { useEffect, useRef, useState } from 'react';
import {
  Check,
  Download,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import type {
  BuiltInFeatureModuleId,
  CustomFeatureCard,
  CustomHelplineItem,
  CustomNewsAlertInput,
  ScamNewsItem,
  SiteUpdatesConfig,
} from '../types/suraksha';
import type { TranslationStrings } from '../utils/i18n';
import {
  DEFAULT_SITE_UPDATES,
  normalizeDomainEntry,
  normalizeSiteUpdatesConfig,
  sanitizeActionUrl,
} from '../utils/siteUpdates';

interface SiteUpdateStudioProps {
  open: boolean;
  t: TranslationStrings;
  config: SiteUpdatesConfig;
  onSaveConfig: (next: SiteUpdatesConfig) => Promise<void> | void;
  onClose: () => void;
}

type StudioTab = 'modules' | 'custom_feature' | 'content' | 'backup';

export function SiteUpdateStudio({
  open,
  t,
  config,
  onSaveConfig,
  onClose,
}: SiteUpdateStudioProps) {
  const [tab, setTab] = useState<StudioTab>('modules');
  const [draft, setDraft] = useState<SiteUpdatesConfig>(config);
  const draftRef = useRef<SiteUpdatesConfig>(config);
  const [statusNote, setStatusNote] = useState<string | null>(null);

  // Custom feature form state
  const [featTitle, setFeatTitle] = useState('');
  const [featBadge, setFeatBadge] = useState('Added Feature');
  const [featDesc, setFeatDesc] = useState('');
  const [featActionLabel, setFeatActionLabel] = useState('');
  const [featActionUrl, setFeatActionUrl] = useState('');

  // Custom news / domain / helpline forms
  const [newsTitle, setNewsTitle] = useState('');
  const [newsSummary, setNewsSummary] = useState('');
  const [newsRegion, setNewsRegion] = useState('Nagpur');
  const [newsCat, setNewsCat] = useState<ScamNewsItem['category']>('kyc_apk');

  const [domainInput, setDomainInput] = useState('');
  const [helpName, setHelpName] = useState('');
  const [helpNumber, setHelpNumber] = useState('');
  const [helpNote, setHelpNote] = useState('');
  const [importJson, setImportJson] = useState('');

  useEffect(() => {
    if (open) {
      draftRef.current = config;
      setDraft(config);
      setStatusNote(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const su = t.siteUpdates;

  const applyUpdate = async (next: SiteUpdatesConfig, note?: string) => {
    const updated = { ...next, updatedAt: new Date().toISOString() };
    draftRef.current = updated;
    setDraft(updated);
    await onSaveConfig(updated);
    setStatusNote(note || su.savedToast);
  };

  const toggleModule = (modId: BuiltInFeatureModuleId) => {
    const base = draftRef.current;
    const next: SiteUpdatesConfig = {
      ...base,
      enabledModules: {
        ...base.enabledModules,
        [modId]: !base.enabledModules[modId],
      },
    };
    void applyUpdate(next);
  };

  const handleAddFeature = () => {
    const cleanTitle = featTitle.trim();
    const cleanDesc = featDesc.trim();
    if (!cleanTitle || !cleanDesc) return;

    const cleanUrl = sanitizeActionUrl(featActionUrl);
    if (featActionUrl.trim() && !cleanUrl) {
      setStatusNote('Action URL must start with https://, http://, tel:, or #section.');
      return;
    }

    const card: CustomFeatureCard = {
      id: `feat_${Date.now()}`,
      title: cleanTitle.slice(0, 80),
      description: cleanDesc.slice(0, 260),
      badge: (featBadge.trim() || 'Added Feature').slice(0, 30),
      actionLabel: featActionLabel.trim().slice(0, 40) || undefined,
      actionUrl: cleanUrl,
      createdAt: new Date().toISOString(),
    };

    void applyUpdate({
      ...draft,
      customFeatures: [card, ...draft.customFeatures],
    });

    setFeatTitle('');
    setFeatDesc('');
    setFeatActionLabel('');
    setFeatActionUrl('');
  };

  const handleAddNews = () => {
    if (!newsTitle.trim() || !newsSummary.trim()) return;
    const item: CustomNewsAlertInput = {
      id: `cnews_${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      category: newsCat,
      region: newsRegion.trim() || 'Community Update',
      source: 'Added via Site Studio',
      title: newsTitle.trim().slice(0, 140),
      summary: newsSummary.trim().slice(0, 360),
      takeaway: 'Verify sender independently or dial 1930 if unsure.',
    };
    void applyUpdate({ ...draft, customNews: [item, ...draft.customNews] });
    setNewsTitle('');
    setNewsSummary('');
  };

  const handleAddDomain = () => {
    const normalized = normalizeDomainEntry(domainInput);
    if (!normalized) {
      setStatusNote('Enter a valid domain like example.org');
      return;
    }
    if (draft.customTrustedDomains.includes(normalized)) return;
    void applyUpdate({
      ...draft,
      customTrustedDomains: [...draft.customTrustedDomains, normalized],
    });
    setDomainInput('');
  };

  const handleAddHelpline = () => {
    if (!helpName.trim() || !helpNumber.trim()) return;
    const entry: CustomHelplineItem = {
      id: `help_${Date.now()}`,
      name: helpName.trim().slice(0, 80),
      number: helpNumber.trim().slice(0, 32),
      note: (helpNote.trim() || 'Custom Helpline').slice(0, 80),
    };
    void applyUpdate({ ...draft, customHelplines: [...draft.customHelplines, entry] });
    setHelpName('');
    setHelpNumber('');
    setHelpNote('');
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cyberrakshak-site-updates.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(importJson);
      const normalized = normalizeSiteUpdatesConfig(parsed);
      void applyUpdate(normalized, 'Imported configuration applied successfully.');
      setImportJson('');
    } catch {
      setStatusNote('Invalid JSON format. Please check and try again.');
    }
  };

  const modules: Array<{ id: BuiltInFeatureModuleId; title: string; desc: string }> = [
    { id: 'sos_card', title: su.modSosTitle, desc: su.modSosDesc },
    { id: 'daily_tip', title: su.modTipTitle, desc: su.modTipDesc },
    { id: 'trusted_contacts', title: su.modContactsTitle, desc: su.modContactsDesc },
    { id: 'pin_hygiene', title: su.modPinTitle, desc: su.modPinDesc },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="studio-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        data-testid="site-update-studio-modal"
        className="my-auto w-full max-w-3xl rounded-2xl border border-[#38bdf8]/25 bg-[#0f1c2d] p-6 text-[#f1f5f9] shadow-2xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-[#38bdf8] uppercase">
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Site Update Studio</span>
            </p>
            <h2 id="studio-title" className="mt-1 text-2xl font-semibold text-white">
              {su.studioTitle}
            </h2>
            <p className="mt-1 text-xs text-[#cbd5e1] sm:text-sm">{su.studioSubtitle}</p>
          </div>
          <button
            type="button"
            data-testid="site-updates-close-btn"
            onClick={onClose}
            aria-label="Close update studio"
            className="cursor-pointer rounded-xl border border-white/15 bg-white/5 p-2 text-[#cbd5e1] hover:bg-white/15 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Studio Tabs */}
        <div className="mt-4 flex flex-wrap gap-2" role="tablist">
          {(
            [
              ['modules', su.tabModules],
              ['custom_feature', su.tabCustomFeature],
              ['content', su.tabContent],
              ['backup', su.tabBackup],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              data-testid={`studio-tab-${key}`}
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`cursor-pointer rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                tab === key
                  ? 'bg-[#38bdf8] text-[#08121c]'
                  : 'border border-white/15 bg-white/5 text-[#cbd5e1] hover:bg-white/10'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {statusNote && (
          <div
            data-testid="studio-status-note"
            className="mt-3 rounded-lg border border-[#38bdf8]/35 bg-[#152a3f] px-3 py-2 text-xs font-medium text-[#bae6fd]"
          >
            {statusNote}
          </div>
        )}

        {/* Tab 1: Built-in Modules */}
        {tab === 'modules' && (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {modules.map((m) => {
              const active = draft.enabledModules[m.id];
              return (
                <button
                  key={m.id}
                  type="button"
                  data-testid={`toggle-module-${m.id}`}
                  onClick={() => toggleModule(m.id)}
                  className={`flex cursor-pointer items-start justify-between gap-3 rounded-xl border p-4 text-left transition-colors ${
                    active
                      ? 'border-[#38bdf8] bg-[#162d44]'
                      : 'border-white/10 bg-[#142030] hover:border-white/25'
                  }`}
                >
                  <div>
                    <h3 className="text-sm font-semibold text-white">{m.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-[#cbd5e1]">{m.desc}</p>
                  </div>
                  <span
                    className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                      active ? 'bg-[#38bdf8] text-[#08121c]' : 'border border-white/20 bg-white/5 text-transparent'
                    }`}
                  >
                    <Check className="h-4 w-4" />
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Tab 2: Custom Feature Card Creator */}
        {tab === 'custom_feature' && (
          <div className="mt-5 space-y-4">
            <div className="grid gap-3 rounded-xl border border-white/10 bg-[#142030] p-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-[#cbd5e1]">Feature Title *</label>
                <input
                  data-testid="custom-feature-title"
                  type="text"
                  value={featTitle}
                  onChange={(e) => setFeatTitle(e.target.value)}
                  placeholder="e.g., Nagpur Senior Citizen Help Desk"
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#0d1724] px-3 py-2 text-xs text-white focus:border-[#38bdf8] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#cbd5e1]">Badge Label</label>
                <input
                  type="text"
                  value={featBadge}
                  onChange={(e) => setFeatBadge(e.target.value)}
                  placeholder="e.g., Community Tool"
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#0d1724] px-3 py-2 text-xs text-white focus:border-[#38bdf8] focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#cbd5e1]">Description *</label>
                <textarea
                  data-testid="custom-feature-desc"
                  rows={2}
                  value={featDesc}
                  onChange={(e) => setFeatDesc(e.target.value)}
                  placeholder="Describe what this added feature helps seniors or caregivers do..."
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#0d1724] px-3 py-2 text-xs text-white focus:border-[#38bdf8] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#cbd5e1]">Button Label (Optional)</label>
                <input
                  type="text"
                  value={featActionLabel}
                  onChange={(e) => setFeatActionLabel(e.target.value)}
                  placeholder="e.g., Open Portal / Call"
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#0d1724] px-3 py-2 text-xs text-white focus:border-[#38bdf8] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#cbd5e1]">Button Link (https / tel / #section)</label>
                <input
                  type="text"
                  value={featActionUrl}
                  onChange={(e) => setFeatActionUrl(e.target.value)}
                  placeholder="https://cybercrime.gov.in or tel:1930"
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#0d1724] px-3 py-2 text-xs text-white focus:border-[#38bdf8] focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="button"
                  data-testid="add-custom-feature-btn"
                  disabled={!featTitle.trim() || !featDesc.trim()}
                  onClick={handleAddFeature}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#38bdf8] px-4 py-2 text-xs font-semibold text-[#08121c] hover:bg-[#5cccfb] disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  <span>{su.addBtn}</span>
                </button>
              </div>
            </div>

            {draft.customFeatures.length > 0 && (
              <div className="space-y-2">
                {draft.customFeatures.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#142030] px-3.5 py-2.5 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-white">{f.title}</span>
                      <span className="ml-2 text-[#94a3b8]">({f.badge})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        void applyUpdate({
                          ...draft,
                          customFeatures: draft.customFeatures.filter((x) => x.id !== f.id),
                        })
                      }
                      aria-label={`Remove ${f.title}`}
                      className="cursor-pointer rounded p-1 text-[#94a3b8] hover:text-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Live Scam News Alerts, Custom Trusted Domains & Helplines */}
        {tab === 'content' && (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {/* Add Scam Alert */}
            <div className="space-y-2.5 rounded-xl border border-white/10 bg-[#142030] p-4">
              <h3 className="text-sm font-semibold text-white">Add Scam News Alert</h3>
              <input
                type="text"
                value={newsTitle}
                onChange={(e) => setNewsTitle(e.target.value)}
                placeholder="Alert headline"
                className="w-full rounded-lg border border-white/15 bg-[#0d1724] px-3 py-1.5 text-xs text-white focus:border-[#38bdf8] focus:outline-none"
              />
              <textarea
                rows={2}
                value={newsSummary}
                onChange={(e) => setNewsSummary(e.target.value)}
                placeholder="Short plain-language warning summary..."
                className="w-full rounded-lg border border-white/15 bg-[#0d1724] px-3 py-1.5 text-xs text-white focus:border-[#38bdf8] focus:outline-none"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newsRegion}
                  onChange={(e) => setNewsRegion(e.target.value)}
                  placeholder="Region (e.g. Nagpur)"
                  className="w-1/2 rounded-lg border border-white/15 bg-[#0d1724] px-2.5 py-1.5 text-xs text-white"
                />
                <select
                  value={newsCat}
                  onChange={(e) => setNewsCat(e.target.value as ScamNewsItem['category'])}
                  className="w-1/2 rounded-lg border border-white/15 bg-[#0d1724] px-2 py-1.5 text-xs text-white"
                >
                  <option value="kyc_apk">Fake KYC / APK</option>
                  <option value="digital_arrest">Digital Arrest</option>
                  <option value="otp_pension">OTP & Pension</option>
                </select>
              </div>
              <button
                type="button"
                disabled={!newsTitle.trim() || !newsSummary.trim()}
                onClick={handleAddNews}
                className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-[#38bdf8] px-3 py-1.5 text-xs font-semibold text-[#08121c] disabled:opacity-50"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Publish Alert</span>
              </button>
            </div>

            {/* Add Trusted Domain & Custom Helpline */}
            <div className="space-y-4">
              <div className="space-y-2 rounded-xl border border-white/10 bg-[#142030] p-4">
                <h3 className="text-sm font-semibold text-white">Add Trusted Website Domain</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    placeholder="e.g., nagpurpolice.gov.in"
                    className="flex-1 rounded-lg border border-white/15 bg-[#0d1724] px-3 py-1.5 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddDomain}
                    className="cursor-pointer rounded-lg bg-[#38bdf8] px-3 py-1.5 text-xs font-semibold text-[#08121c]"
                  >
                    Add
                  </button>
                </div>
                {draft.customTrustedDomains.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {draft.customTrustedDomains.map((dom) => (
                      <button
                        key={dom}
                        type="button"
                        onClick={() =>
                          void applyUpdate({
                            ...draft,
                            customTrustedDomains: draft.customTrustedDomains.filter((d) => d !== dom),
                          })
                        }
                        className="inline-flex cursor-pointer items-center gap-1 rounded bg-white/10 px-2 py-0.5 text-[11px] text-[#e2e8f0] hover:bg-white/20"
                      >
                        <span>{dom}</span>
                        <X className="h-3 w-3" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2 rounded-xl border border-white/10 bg-[#142030] p-4">
                <h3 className="text-sm font-semibold text-white">Add Helpline Number</h3>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={helpName}
                    onChange={(e) => setHelpName(e.target.value)}
                    placeholder="Office Name"
                    className="rounded-lg border border-white/15 bg-[#0d1724] px-2.5 py-1.5 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={helpNumber}
                    onChange={(e) => setHelpNumber(e.target.value)}
                    placeholder="Phone Number"
                    className="rounded-lg border border-white/15 bg-[#0d1724] px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={helpNote}
                    onChange={(e) => setHelpNote(e.target.value)}
                    placeholder="Short note (optional)"
                    className="flex-1 rounded-lg border border-white/15 bg-[#0d1724] px-2.5 py-1.5 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddHelpline}
                    className="cursor-pointer rounded-lg bg-[#38bdf8] px-3 py-1.5 text-xs font-semibold text-[#08121c]"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Export / Import / Reset */}
        {tab === 'backup' && (
          <div className="mt-5 space-y-4">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleExportJson}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#38bdf8] px-4 py-2 text-xs font-semibold text-[#08121c]"
              >
                <Download className="h-4 w-4" />
                <span>{su.exportBtn}</span>
              </button>
              <button
                type="button"
                onClick={() => void applyUpdate({ ...DEFAULT_SITE_UPDATES }, 'Added updates cleared.')}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#c63d2f]/60 bg-[#c63d2f]/15 px-4 py-2 text-xs font-semibold text-[#fca5a5]"
              >
                <RotateCcw className="h-4 w-4" />
                <span>{su.resetBtn}</span>
              </button>
            </div>

            <div className="space-y-2 rounded-xl border border-white/10 bg-[#142030] p-4">
              <label className="block text-xs font-medium text-[#cbd5e1]">{su.importBtn}</label>
              <textarea
                rows={4}
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder='{"enabledModules": {"sos_card": true}}'
                className="w-full rounded-lg border border-white/15 bg-[#0d1724] p-2.5 font-mono text-xs text-[#e2e8f0]"
              />
              <button
                type="button"
                disabled={!importJson.trim()}
                onClick={handleImportJson}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-white/10 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/20 disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                <span>{su.importBtn}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
