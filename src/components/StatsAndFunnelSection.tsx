import type { TranslationStrings } from '../utils/i18n';

interface StatsAndFunnelSectionProps {
  t: TranslationStrings;
}

export function StatsAndFunnelSection({ t }: StatsAndFunnelSectionProps) {
  const s = t.stats;

  const funnelSteps = [
    { title: s.step1Title, desc: s.step1Desc, tone: 'border-white/15 bg-[#242820]' },
    { title: s.step2Title, desc: s.step2Desc, tone: 'border-[#dd8940]/40 bg-[#2d2820]' },
    { title: s.step3Title, desc: s.step3Desc, tone: 'border-[#c63d2f]/40 bg-[#322220]' },
    { title: s.step4Title, desc: s.step4Desc, tone: 'border-white/15 bg-[#1e221b]' },
  ];

  return (
    <section id="stats" className="bg-[#34382f] py-14 text-[#f2f3ef] sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {s.sectionTitle}
          </h2>
          <p className="mt-2 text-base leading-relaxed text-[#cfd4c7]">{s.sectionSubtitle}</p>
        </div>

        {/* 3 I4C Statistics */}
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-white/12 bg-[#252921] p-6">
            <p className="tabular-nums text-3xl font-bold text-[#dd8940] sm:text-4xl">
              {t.hero.stat1Value}
            </p>
            <p className="mt-2 text-sm font-medium text-white">{s.statIndiaLabel}</p>
            <p className="mt-1 text-xs text-[#aeb5a3]">{s.statIndiaSub}</p>
          </div>
          <div className="rounded-2xl border border-white/12 bg-[#252921] p-6">
            <p className="tabular-nums text-3xl font-bold text-[#dd8940] sm:text-4xl">
              {t.hero.stat2Value}
            </p>
            <p className="mt-2 text-sm font-medium text-white">{s.statMhLabel}</p>
            <p className="mt-1 text-xs text-[#aeb5a3]">{s.statMhSub}</p>
          </div>
          <div className="rounded-2xl border border-white/12 bg-[#252921] p-6">
            <p className="tabular-nums text-3xl font-bold text-[#dd8940] sm:text-4xl">58,239</p>
            <p className="mt-2 text-sm font-medium text-white">{s.statArrestLabel}</p>
            <p className="mt-1 text-xs text-[#aeb5a3]">{s.statArrestSub}</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-[#aeb5a3]">{s.sourceNote}</p>

        {/* 4-Stage Scam Funnel */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold text-white">{s.funnelTitle}</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {funnelSteps.map((step) => (
              <div key={step.title} className={`rounded-xl border p-5 ${step.tone}`}>
                <h4 className="text-base font-semibold text-white">{step.title}</h4>
                <p className="mt-1.5 text-sm leading-relaxed text-[#d4d8cc]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mt-12 overflow-hidden rounded-2xl border border-white/12 bg-[#252921]">
          <div className="border-b border-white/10 px-6 py-4">
            <h3 className="text-lg font-semibold text-white">{s.comparisonTitle}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-black/20 text-xs uppercase text-[#aeb5a3]">
                <tr>
                  <th className="px-6 py-3 font-semibold">{s.colGap}</th>
                  <th className="px-6 py-3 font-semibold">{s.colToday}</th>
                  <th className="px-6 py-3 font-semibold text-[#b8cc97]">{s.colSaathi}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {s.gapRows.map((row) => (
                  <tr key={row.aspect}>
                    <td className="px-6 py-4 font-semibold text-white">{row.aspect}</td>
                    <td className="px-6 py-4 text-[#c2c7ba]">{row.today}</td>
                    <td className="px-6 py-4 font-medium text-[#e8efe0]">{row.saathi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
