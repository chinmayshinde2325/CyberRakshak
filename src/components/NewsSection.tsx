import { useState } from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { SCAM_NEWS_ITEMS } from '../data/scamNews';
import type {
  CustomNewsAlertInput,
  LanguageCode,
  ScamGymScenario,
  ScamNewsItem,
} from '../types/suraksha';
import type { TranslationStrings } from '../utils/i18n';
import { toLocalizedCustomNewsItem } from '../utils/siteUpdates';

interface NewsSectionProps {
  t: TranslationStrings;
  lang: LanguageCode;
  largeText: boolean;
  customNews?: CustomNewsAlertInput[];
  onPracticeScenario: (scenarioId: ScamGymScenario['id']) => void;
  onAskAssistantTopic: (topic: string) => void;
}

export function NewsSection({
  t,
  lang,
  largeText,
  customNews = [],
  onPracticeScenario,
  onAskAssistantTopic,
}: NewsSectionProps) {
  const [filter, setFilter] = useState<'all' | ScamNewsItem['category']>('all');
  const n = t.news;

  const allItems: ScamNewsItem[] = [
    ...customNews.map(toLocalizedCustomNewsItem),
    ...SCAM_NEWS_ITEMS,
  ];

  const filtered =
    filter === 'all'
      ? allItems
      : allItems.filter((item) => item.category === filter);

  const tabs: Array<{ key: 'all' | ScamNewsItem['category']; label: string }> = [
    { key: 'all', label: n.filterAll },
    { key: 'digital_arrest', label: n.filterArrest },
    { key: 'kyc_apk', label: n.filterKyc },
    { key: 'otp_pension', label: n.filterOtp },
  ];

  return (
    <section id="news" className="bg-[#2c3028] py-14 text-[#f2f3ef] sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {n.sectionTitle}
            </h2>
            <p className={`mt-2 leading-relaxed text-[#cfd4c7] ${largeText ? 'text-lg' : 'text-base'}`}>
              {n.sectionSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap gap-2" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={filter === tab.key}
                onClick={() => setFilter(tab.key)}
                className={`cursor-pointer rounded-lg px-3.5 py-2 text-xs font-medium transition-colors sm:text-sm ${
                  filter === tab.key
                    ? 'bg-[#f2f3ef] text-[#23261f]'
                    : 'border border-white/15 bg-white/5 text-[#d4d8cc] hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {filtered.map((item) => (
            <article
              key={item.id}
              data-testid={`news-card-${item.id}`}
              className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#22261f] p-6"
            >
              <div>
                <p className="tabular-nums text-xs font-medium tracking-wide text-[#93a476]">
                  {item.date} · {item.region} · {item.source}
                </p>
                <h3 className="mt-2 text-xl font-semibold leading-snug text-white">
                  {item.title[lang]}
                </h3>
                <p className={`mt-2.5 leading-relaxed text-[#cfd4c7] ${largeText ? 'text-base' : 'text-sm'}`}>
                  {item.summary[lang]}
                </p>
                <p className="mt-3 border-t border-white/10 pt-3 text-sm font-medium text-[#e7b57c]">
                  {item.takeaway[lang]}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-4 pt-1">
                <button
                  type="button"
                  onClick={() => onPracticeScenario(item.practiceScenarioId)}
                  className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-[#93a476] hover:text-[#b7c999]"
                >
                  <span>{n.practiceThisBtn}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={() => onAskAssistantTopic(item.title[lang])}
                  className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-[#d4d8cc] hover:text-white"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  <span>{n.askAssistantBtn}</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
