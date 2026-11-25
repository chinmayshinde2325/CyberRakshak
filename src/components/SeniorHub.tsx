import { Dumbbell, Mic, Newspaper, ShieldAlert } from 'lucide-react';
import type { FamilyProfile } from '../types/suraksha';
import type { TranslationStrings } from '../utils/i18n';

interface SeniorHubProps {
  t: TranslationStrings;
  profile: FamilyProfile | null;
  onNavigateSection: (id: string) => void;
  onOpenAssistant: () => void;
}

export function SeniorHub({
  t,
  profile,
  onNavigateSection,
  onOpenAssistant,
}: SeniorHubProps) {
  const s = t.seniorHome;

  const tiles = [
    {
      id: 'protect',
      title: s.tileSafeTitle,
      desc: s.tileSafeDesc,
      icon: ShieldAlert,
      accent: 'bg-[#0f4c5c] text-white',
      onClick: () => onNavigateSection('protect'),
    },
    {
      id: 'scam-gym',
      title: s.tileGymTitle,
      desc: s.tileGymDesc,
      icon: Dumbbell,
      accent: 'bg-[#dd8940] text-[#1c1f19]',
      onClick: () => onNavigateSection('scam-gym'),
    },
    {
      id: 'voice-saathi',
      title: s.tileVoiceTitle,
      desc: s.tileVoiceDesc,
      icon: Mic,
      accent: 'bg-[#0e7490] text-white',
      onClick: () => onOpenAssistant(),
    },
    {
      id: 'news',
      title: s.tileNewsTitle,
      desc: s.tileNewsDesc,
      icon: Newspaper,
      accent: 'bg-[#101c2b] text-white',
      onClick: () => onNavigateSection('news'),
    },
  ];

  return (
    <section id="senior-hub" className="bg-[#f2f3ef] py-12 text-[#23261f] sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {s.greetingPrefix} {profile ? profile.seniorName : 'Ji'}
          </h2>
          <p className="mt-2 text-lg leading-relaxed text-[#4f5448]">{s.subtitle}</p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {tiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <button
                key={tile.id}
                type="button"
                onClick={tile.onClick}
                className="group flex cursor-pointer items-start gap-5 rounded-2xl border border-[#23261f]/12 bg-white p-6 text-left transition-all hover:border-[#0e7490] hover:shadow-lg"
              >
                <span
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${tile.accent}`}
                >
                  <Icon className="h-7 w-7" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-xl font-semibold text-[#23261f] group-hover:text-[#2f3c24]">
                    {tile.title}
                  </h3>
                  <p className="mt-1.5 text-base leading-relaxed text-[#4f5448]">{tile.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
