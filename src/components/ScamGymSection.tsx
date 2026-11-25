import { useState } from 'react';
import {
  AlertOctagon,
  ExternalLink,
  Landmark,
  PhoneOff,
  Play,
  ShieldCheck,
  Volume2,
} from 'lucide-react';
import { SANDBOX_TEST_ITEMS, SCAM_GYM_SCENARIOS } from '../data/scamNews';
import type {
  LanguageCode,
  SandboxLinkItem,
  ScamGymScenario,
} from '../types/suraksha';
import type { TranslationStrings } from '../utils/i18n';
import { analyzeThreatDeterministic } from '../utils/scamEngine';
import { speakInLanguage, unlockAudioPlayback } from '../utils/speechPlayer';

interface ScamGymSectionProps {
  t: TranslationStrings;
  lang: LanguageCode;
  largeText: boolean;
  selectedScenarioId: ScamGymScenario['id'];
  practicedIds: string[];
  onSelectScenario: (id: ScamGymScenario['id']) => void;
  onScenarioPracticed: (id: string) => void;
  onSandboxThreatTriggered: (item: SandboxLinkItem) => void;
}

export function ScamGymSection({
  t,
  lang,
  largeText,
  selectedScenarioId,
  practicedIds,
  onSelectScenario,
  onScenarioPracticed,
  onSandboxThreatTriggered,
}: ScamGymSectionProps) {
  const g = t.scamGym;
  const activeScenario =
    SCAM_GYM_SCENARIOS.find((s) => s.id === selectedScenarioId) ?? SCAM_GYM_SCENARIOS[0];

  const [sandboxSafeToast, setSandboxSafeToast] = useState<string | null>(null);
  const [userReply, setUserReply] = useState('');
  const [loadingReply, setLoadingReply] = useState(false);
  const [callTurns, setCallTurns] = useState<
    Array<{ speaker: 'scammer' | 'senior' | 'coach'; text: string; flag?: string }>
  >([]);
  const [callError, setCallError] = useState<string | null>(null);

  const speakText = (text: string) => {
    unlockAudioPlayback();
    void speakInLanguage({ text, lang });
  };

  const handleSandboxClick = (item: SandboxLinkItem) => {
    const analysis = analyzeThreatDeterministic(item.urlOrApp, lang);
    if (analysis.riskLevel === 'red' || item.expectedRisk === 'red') {
      setSandboxSafeToast(null);
      onSandboxThreatTriggered(item);
    } else {
      setSandboxSafeToast(`${item.label[lang]} — ${analysis.reasons[0]}`);
    }
  };

  const handleStartCall = () => {
    unlockAudioPlayback();
    setCallError(null);
    const opening = activeScenario.openingLine[lang];
    setCallTurns([{ speaker: 'scammer', text: opening }]);
    speakText(opening);
  };

  const handleSendReply = async () => {
    const trimmed = userReply.trim();
    if (!trimmed) return;

    const currentTurns = [...callTurns, { speaker: 'senior' as const, text: trimmed }];
    setCallTurns(currentTurns);
    setUserReply('');
    setLoadingReply(true);
    setCallError(null);

    try {
      const resp = await fetch('/api/scam-gym/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: activeScenario.id,
          userReply: trimmed,
          language: lang,
        }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        setCallError(err.error || 'Unable to reach AI Scam Gym coach right now.');
        return;
      }
      const data = await resp.json();
      setCallTurns([
        ...currentTurns,
        {
          speaker: 'scammer',
          text: data.scammerReply,
        },
        {
          speaker: 'coach',
          text: data.coachFeedback,
          flag: data.detectedRedFlag,
        },
      ]);
      if (data.seniorPassed) {
        onScenarioPracticed(activeScenario.id);
      }
    } catch {
      setCallError('Network error communicating with Scam Gym simulator.');
    } finally {
      setLoadingReply(false);
    }
  };

  const handleHangUpComplete = () => {
    onScenarioPracticed(activeScenario.id);
    setCallTurns((prev) => [
      ...prev,
      {
        speaker: 'coach',
        text: activeScenario.safeReplyTip[lang],
      },
    ]);
  };

  return (
    <section id="scam-gym" className="bg-[#f2f3ef] py-14 text-[#23261f] sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{g.sectionTitle}</h2>
            <p className={`mt-2 leading-relaxed text-[#4f5448] ${largeText ? 'text-lg' : 'text-base'}`}>
              {g.sectionSubtitle}
            </p>
          </div>
          <div className="rounded-xl border border-[#23261f]/15 bg-white px-4 py-2.5 text-sm font-medium">
            <span className="text-[#5a6054]">{g.lessonsPassedLabel}: </span>
            <span className="tabular-nums font-bold text-[#2f3c24]">
              {practicedIds.length} / {SCAM_GYM_SCENARIOS.length}
            </span>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* Mock Banking & Safe-Browsing Sandbox */}
          <div className="rounded-2xl border border-[#23261f]/12 bg-white p-6 shadow-sm lg:col-span-5">
            <div className="flex items-center gap-2.5">
              <Landmark className="h-5 w-5 text-[#4a5d34]" aria-hidden="true" />
              <h3 className="text-xl font-semibold">{g.sandboxTitle}</h3>
            </div>
            <p className="mt-1.5 text-sm text-[#4f5448]">{g.sandboxSubtitle}</p>

            {/* Pretend Pension Card */}
            <div className="mt-4 rounded-xl bg-[#272b23] p-4 text-white">
              <p className="text-xs text-[#aeb5a3] uppercase tracking-wider">{g.pretendBalanceLabel}</p>
              <p className="tabular-nums mt-1 text-2xl font-bold text-[#e8efe0]">₹ 1,42,500.00</p>
            </div>

            <p className="mt-4 text-xs font-semibold text-[#4f5448] uppercase tracking-wide">
              {g.sandboxHint}
            </p>

            <div className="mt-2.5 space-y-2.5">
              {SANDBOX_TEST_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  data-testid={`sandbox-item-${item.id}`}
                  onClick={() => handleSandboxClick(item)}
                  className="flex w-full cursor-pointer items-start justify-between gap-3 rounded-xl border border-[#23261f]/15 bg-[#f9faf7] p-3.5 text-left transition-colors hover:border-[#4a5d34] hover:bg-[#eef2e8]"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#23261f]">{item.label[lang]}</p>
                    <p className="mt-0.5 text-xs text-[#5a6054]">{item.description[lang]}</p>
                  </div>
                  <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-[#5a6054]" aria-hidden="true" />
                </button>
              ))}
            </div>

            {sandboxSafeToast && (
              <div
                data-testid="sandbox-safe-feedback"
                className="mt-4 flex items-start gap-2 rounded-xl border border-[#3f7a4c]/40 bg-[#3f7a4c]/10 p-3 text-xs font-medium text-[#1f4d29]"
              >
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{sandboxSafeToast}</span>
              </div>
            )}
          </div>

          {/* AI-Voiced Scam Call Practice */}
          <div className="rounded-2xl border border-[#23261f]/12 bg-white p-6 shadow-sm lg:col-span-7">
            <h3 className="text-xl font-semibold">{g.callGymTitle}</h3>
            <p className="mt-1 text-sm text-[#4f5448]">{g.callGymSubtitle}</p>

            {/* Scenario Tabs */}
            <div className="mt-4 flex flex-wrap gap-2" role="tablist">
              {SCAM_GYM_SCENARIOS.map((sc) => (
                <button
                  key={sc.id}
                  type="button"
                  role="tab"
                  aria-selected={sc.id === activeScenario.id}
                  onClick={() => {
                    onSelectScenario(sc.id);
                    setCallTurns([]);
                    setCallError(null);
                  }}
                  className={`cursor-pointer rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors sm:text-sm ${
                    sc.id === activeScenario.id
                      ? 'bg-[#2f3c24] text-white'
                      : 'border border-[#23261f]/15 bg-[#f2f3ef] text-[#23261f] hover:bg-[#e5e8df]'
                  }`}
                >
                  {sc.title[lang]}
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-[#23261f]/12 bg-[#f9faf7] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#23261f]/10 pb-3">
                <span className="text-sm font-semibold text-[#23261f]">
                  {activeScenario.callerLabel[lang]}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    data-testid="scam-gym-start-btn"
                    onClick={handleStartCall}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#dd8940] px-3.5 py-1.5 text-xs font-semibold text-[#1c1f19] hover:bg-[#e79750]"
                  >
                    <Play className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{g.startCallBtn}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => speakText(activeScenario.openingLine[lang])}
                    aria-label="Listen to caller voice"
                    className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#23261f]/15 bg-white px-2.5 py-1.5 text-xs font-medium text-[#23261f] hover:bg-[#eef2e8]"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Conversation Window */}
              <div className="mt-3 max-h-60 space-y-2.5 overflow-y-auto pr-1">
                {callTurns.length === 0 ? (
                  <p className="text-sm text-[#4f5448]">{activeScenario.openingLine[lang]}</p>
                ) : (
                  callTurns.map((turn, idx) => (
                    <div
                      key={idx}
                      className={`rounded-lg p-3 text-sm ${
                        turn.speaker === 'scammer'
                          ? 'bg-[#fcecea] text-[#6d1f17]'
                          : turn.speaker === 'senior'
                            ? 'ml-6 bg-[#2f3c24] text-white'
                            : 'border border-[#4a5d34]/30 bg-[#eef2e8] text-[#23261f]'
                      }`}
                    >
                      {turn.flag && (
                        <p className="mb-1 text-xs font-bold uppercase text-[#9b3b1e]">
                          {turn.flag}
                        </p>
                      )}
                      <p>{turn.text}</p>
                    </div>
                  ))
                )}
              </div>

              {callError && <p className="mt-2 text-xs text-[#b93829]">{callError}</p>}

              <div className="mt-3 flex flex-wrap gap-2">
                <input
                  type="text"
                  value={userReply}
                  onChange={(e) => setUserReply(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendReply();
                  }}
                  placeholder={g.replyPlaceholder}
                  className="min-w-[200px] flex-1 rounded-lg border border-[#23261f]/20 bg-white px-3 py-2 text-sm text-[#23261f] focus:border-[#4a5d34] focus:outline-none"
                />
                <button
                  type="button"
                  disabled={loadingReply || !userReply.trim()}
                  onClick={handleSendReply}
                  className="cursor-pointer rounded-lg bg-[#2f3c24] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3f5031] disabled:opacity-50 sm:text-sm"
                >
                  {g.sendReplyBtn}
                </button>
                <button
                  type="button"
                  onClick={handleHangUpComplete}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#c63d2f] bg-[#c63d2f]/10 px-3.5 py-2 text-xs font-semibold text-[#9d2417] hover:bg-[#c63d2f]/20 sm:text-sm"
                >
                  <PhoneOff className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{g.refuseHangupBtn}</span>
                </button>
              </div>
            </div>

            {/* Red-Flag Replay & Safe Tip */}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[#c63d2f]/20 bg-[#fdf5f4] p-4">
                <h4 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-[#9d2417] uppercase">
                  <AlertOctagon className="h-4 w-4" />
                  <span>{g.redFlagReplayTitle}</span>
                </h4>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-relaxed text-[#4b231e]">
                  {activeScenario.redFlags[lang].map((flag, i) => (
                    <li key={i}>{flag}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-[#3f7a4c]/25 bg-[#f2f7f3] p-4">
                <h4 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-[#1f4d29] uppercase">
                  <ShieldCheck className="h-4 w-4" />
                  <span>{g.safeTipTitle}</span>
                </h4>
                <p className="mt-2 text-sm font-medium leading-relaxed text-[#1f4d29]">
                  {activeScenario.safeReplyTip[lang]}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
