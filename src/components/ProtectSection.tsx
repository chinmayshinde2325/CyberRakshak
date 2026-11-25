import { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  PhoneCall,
  Search,
  ShieldAlert,
} from 'lucide-react';
import { HELPLINE_DIRECTORY } from '../data/scamNews';
import type {
  CaregiverAlert,
  LanguageCode,
  ThreatAnalysisResult,
} from '../types/suraksha';
import type { TranslationStrings } from '../utils/i18n';
import { analyzeThreatDeterministic } from '../utils/scamEngine';

interface ProtectSectionProps {
  t: TranslationStrings;
  lang: LanguageCode;
  largeText: boolean;
  customTrustedDomains?: string[];
  customHelplines?: Array<{ id: string; name: string; number: string; note: string }>;
  onRequireSetup: () => void;
  onDispatchCaregiverAlert: (params: {
    riskLevel: ThreatAnalysisResult['riskLevel'];
    category: ThreatAnalysisResult['category'];
    sourceType: 'sms' | 'website' | 'app';
    targetSummary: string;
    maskedReason: string;
    rawSnippet?: string;
  }) => Promise<CaregiverAlert | null>;
}

export function ProtectSection({
  t,
  lang,
  largeText,
  customTrustedDomains = [],
  customHelplines = [],
  onRequireSetup,
  onDispatchCaregiverAlert,
}: ProtectSectionProps) {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<(ThreatAnalysisResult & { aiError?: string }) | null>(null);
  const [dispatchedAlert, setDispatchedAlert] = useState<CaregiverAlert | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const p = t.protect;

  const runAnalysis = async (textOverride?: string) => {
    const candidate = (textOverride ?? inputText).trim();
    if (!candidate) return;
    if (textOverride) setInputText(textOverride);

    setLoading(true);
    setApiError(null);
    setDispatchedAlert(null);

    // Immediate deterministic risk assessment
    const localResult = analyzeThreatDeterministic(candidate, lang, customTrustedDomains);
    setResult(localResult);

    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 12000);
    let finalResult: ThreatAnalysisResult & { aiError?: string } = localResult;

    try {
      const resp = await fetch('/api/analyze-threat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          text: candidate,
          language: lang,
          extraTrustedDomains: customTrustedDomains,
        }),
      });

      if (resp.ok) {
        finalResult = await resp.json();
        setResult(finalResult);
      } else {
        const errBody = await resp.json().catch(() => ({}));
        setApiError(errBody.error || 'AI explanation unavailable; showing rule-based assessment.');
      }
    } catch {
      setApiError('AI explanation timed out or unavailable; deterministic safety meter shown.');
    } finally {
      window.clearTimeout(timer);
    }

    if (finalResult.riskLevel === 'red') {
      const lower = candidate.toLowerCase();
      const sourceType = lower.includes('.apk')
        ? 'app'
        : lower.includes('http') || lower.includes('.xyz') || lower.includes('.top')
          ? 'website'
          : 'sms';

      const alert = await onDispatchCaregiverAlert({
        riskLevel: 'red',
        category: finalResult.category,
        sourceType,
        targetSummary: candidate.slice(0, 90),
        maskedReason: finalResult.reasons[0] || 'High-risk fraud pattern detected.',
        rawSnippet: candidate,
      });
      if (alert) setDispatchedAlert(alert);
    }

    setLoading(false);
  };

  const riskBadgeClass =
    result?.riskLevel === 'red'
      ? 'border-[#c63d2f] bg-[#c63d2f]/12 text-[#8d1f15]'
      : result?.riskLevel === 'yellow'
        ? 'border-[#d98b26] bg-[#d98b26]/12 text-[#855109]'
        : 'border-[#3f7a4c] bg-[#3f7a4c]/12 text-[#1f4d29]';

  return (
    <section id="protect" className="border-t border-white/10 bg-[#e7ebe2] py-14 text-[#23261f] sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Left: Is This Safe Analyzer */}
          <div className="lg:col-span-7">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{p.sectionTitle}</h2>
            <p className={`mt-2 leading-relaxed text-[#4f5448] ${largeText ? 'text-lg' : 'text-base'}`}>
              {p.sectionSubtitle}
            </p>

            <div className="mt-6 rounded-2xl border border-[#23261f]/12 bg-white p-5 shadow-sm sm:p-6">
              <textarea
                data-testid="protect-input"
                rows={3}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={p.inputPlaceholder}
                className={`w-full rounded-xl border border-[#23261f]/20 bg-[#f9faf7] p-3.5 text-[#23261f] focus:border-[#4a5d34] focus:outline-none ${
                  largeText ? 'text-lg' : 'text-base'
                }`}
              />

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    runAnalysis('Your SBI account will be suspended today. Update KYC: sbi-kyc-update.xyz')
                  }
                  className="cursor-pointer rounded-lg border border-[#23261f]/15 bg-[#f2f3ef] px-3 py-1.5 text-xs font-medium text-[#23261f] hover:bg-[#e5e8df]"
                >
                  {p.loadSampleKyc}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    runAnalysis(
                      'CBI Customs Officer: Your Aadhaar is in a parcel case. Stay on video call for Digital Arrest and pay ₹1,50,000.',
                    )
                  }
                  className="cursor-pointer rounded-lg border border-[#23261f]/15 bg-[#f2f3ef] px-3 py-1.5 text-xs font-medium text-[#23261f] hover:bg-[#e5e8df]"
                >
                  {p.loadSampleArrest}
                </button>
                <button
                  type="button"
                  onClick={() => runAnalysis('https://onlinesbi.sbi')}
                  className="cursor-pointer rounded-lg border border-[#23261f]/15 bg-[#f2f3ef] px-3 py-1.5 text-xs font-medium text-[#23261f] hover:bg-[#e5e8df]"
                >
                  {p.loadSampleSafe}
                </button>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  data-testid="protect-analyze-btn"
                  disabled={loading || !inputText.trim()}
                  onClick={() => runAnalysis()}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#2f3c24] px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-[#3f5031] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Search className="h-4 w-4" aria-hidden="true" />
                  <span>{loading ? p.analyzingBtn : p.analyzeBtn}</span>
                </button>
              </div>

              {apiError && (
                <p className="mt-3 text-xs text-[#7c6131]">{apiError}</p>
              )}

              {/* Risk Meter Output */}
              {result && (
                <div
                  data-testid="protect-result"
                  className={`mt-6 rounded-xl border-2 p-5 ${riskBadgeClass}`}
                >
                  {/* 3-segment visual Red / Yellow / Green Meter */}
                  <div className="grid grid-cols-3 gap-2" aria-label="Risk Meter">
                    <div
                      className={`h-2.5 rounded-full ${
                        result.riskLevel === 'red' ? 'bg-[#c63d2f]' : 'bg-black/10'
                      }`}
                    />
                    <div
                      className={`h-2.5 rounded-full ${
                        result.riskLevel === 'yellow' ? 'bg-[#d98b26]' : 'bg-black/10'
                      }`}
                    />
                    <div
                      className={`h-2.5 rounded-full ${
                        result.riskLevel === 'green' ? 'bg-[#3f7a4c]' : 'bg-black/10'
                      }`}
                    />
                  </div>

                  <div className="mt-3 flex items-center gap-2.5">
                    {result.riskLevel === 'red' ? (
                      <ShieldAlert className="h-6 w-6 shrink-0 text-[#c63d2f]" />
                    ) : result.riskLevel === 'yellow' ? (
                      <AlertTriangle className="h-6 w-6 shrink-0 text-[#d98b26]" />
                    ) : (
                      <CheckCircle2 className="h-6 w-6 shrink-0 text-[#3f7a4c]" />
                    )}
                    <h3 className="text-xl font-bold">
                      {result.riskLevel === 'red'
                        ? p.riskRed
                        : result.riskLevel === 'yellow'
                          ? p.riskYellow
                          : p.riskGreen}
                    </h3>
                  </div>

                  {result.aiExplanation && (
                    <div className="mt-3 rounded-lg bg-white/80 p-3 text-sm text-[#23261f]">
                      <p className="text-xs font-semibold tracking-wide text-[#556343] uppercase">
                        {p.aiExplanationHeading}
                      </p>
                      <p className="mt-1 leading-relaxed">{result.aiExplanation}</p>
                    </div>
                  )}

                  <div className="mt-4">
                    <h4 className="text-sm font-semibold uppercase tracking-wide">{p.whyHeading}</h4>
                    <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm">
                      {result.reasons.map((reason, idx) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-semibold uppercase tracking-wide">
                      {p.nextStepsHeading}
                    </h4>
                    <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm">
                      {result.nextSteps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ul>
                  </div>

                  {dispatchedAlert && (
                    <div className="mt-4 rounded-lg border border-[#c63d2f]/30 bg-white p-3.5 text-[#23261f]">
                      <p className="text-xs font-semibold text-[#b93829]">
                        {dispatchedAlert.caregiverPhone
                          ? `${p.caregiverAlertedNotice} (${dispatchedAlert.caregiverName})`
                          : t.warningModal.guestBanner}
                      </p>
                      <div className="mt-2.5 flex flex-wrap gap-2.5">
                        {dispatchedAlert.caregiverPhone && dispatchedAlert.whatsappUrl ? (
                          <a
                            href={dispatchedAlert.whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1d7a46] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#166137]"
                          >
                            <span>{p.openWhatsappAlertBtn}</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={onRequireSetup}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#0f4c5c] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#156074]"
                          >
                            <span>{t.warningModal.addCaregiverBtn}</span>
                          </button>
                        )}
                        <a
                          href="tel:1930"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#c63d2f] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#a82e22]"
                        >
                          <PhoneCall className="h-3.5 w-3.5" />
                          <span>{p.call1930Btn}</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: 1930 & Bank Grievance Helpline Directory */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-[#23261f]/12 bg-[#272b23] p-6 text-[#f2f3ef]">
              <h3 className="text-xl font-semibold">{p.helplineDirectoryTitle}</h3>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href="tel:1930"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#c63d2f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#b03225]"
                >
                  <PhoneCall className="h-4 w-4" aria-hidden="true" />
                  <span>{p.call1930Btn}</span>
                </a>
                <a
                  href="https://cybercrime.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-medium text-[#f2f3ef] hover:bg-white/10"
                >
                  <span>{p.portalLinkLabel}</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              <dl className="mt-6 divide-y divide-white/10">
                {[...customHelplines, ...HELPLINE_DIRECTORY].map((item) => (
                  <div key={`${item.name}-${item.number}`} className="flex items-center justify-between gap-4 py-3">
                    <div>
                      <dt className="text-sm font-medium text-white">{item.name}</dt>
                      <dd className="text-xs text-[#aeb5a3]">{item.note}</dd>
                    </div>
                    <span className="tabular-nums text-sm font-semibold text-[#dd8940]">
                      {item.number}
                    </span>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
