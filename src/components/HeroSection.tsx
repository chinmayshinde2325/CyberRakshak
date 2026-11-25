import { useEffect, useRef } from 'react';
import { Globe, LogIn, Mic, ShieldCheck, UserCheck } from 'lucide-react';
import { SylvaHero } from '../shaders/landing-pages/LandingPages';
import type { FamilyProfile, LanguageCode } from '../types/suraksha';
import { LANGUAGES, type TranslationStrings } from '../utils/i18n';

interface HeroSectionProps {
  lang: LanguageCode;
  t: TranslationStrings;
  profile: FamilyProfile | null;
  onChangeLang: (lang: LanguageCode) => void;
  onOpenSetup: () => void;
  onNavigateSection: (sectionId: string) => void;
  onOpenVoiceAssistant: () => void;
  onSwitchToCaregiver: () => void;
}

export function HeroSection({
  lang,
  t,
  profile,
  onChangeLang,
  onOpenSetup,
  onNavigateSection,
  onOpenVoiceAssistant,
  onSwitchToCaregiver,
}: HeroSectionProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const callbacksRef = useRef({
    onNavigateSection,
    onOpenVoiceAssistant,
    onSwitchToCaregiver,
  });

  useEffect(() => {
    callbacksRef.current = {
      onNavigateSection,
      onOpenVoiceAssistant,
      onSwitchToCaregiver,
    };
  }, [onNavigateSection, onOpenVoiceAssistant, onSwitchToCaregiver]);

  useEffect(() => {
    const container = wrapRef.current;
    if (!container) return;

    const syncHeroDocument = () => {
      const iframe = container.querySelector('iframe');
      const doc = iframe?.contentDocument;
      if (!doc || !doc.body) return;

      // Inject Devanagari font support into the same-origin frame
      if (!doc.getElementById('suraksha-fonts-override')) {
        const link = doc.createElement('link');
        link.id = 'suraksha-fonts-override';
        link.rel = 'stylesheet';
        link.href =
          'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@300;400;500;600&display=swap';
        doc.head.appendChild(link);

        const style = doc.createElement('style');
        style.id = 'suraksha-locale-style';
        style.textContent = `
          body, .headline, .lede, .dock-item, .card h2, .card .label, .pill .lbl, .stat dt, .stat dd, .scroll {
            font-family: 'Lexend', 'Noto Sans Devanagari', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
          }
          .headline { max-width: calc(640 * var(--u)); }
        `;
        doc.head.appendChild(style);
      }

      const h = t.hero;

      // Headline lines
      const headlineSpans = doc.querySelectorAll('.headline span i');
      if (headlineSpans[0]) headlineSpans[0].textContent = h.headlineLine1;
      if (headlineSpans[1]) headlineSpans[1].textContent = h.headlineLine2;

      // Lede copy
      const lede = doc.querySelector('.lede');
      if (lede) lede.textContent = h.lede;

      // Ghost wordmark
      const ghost = doc.querySelector('.ghost');
      if (ghost) ghost.textContent = h.ghostWord;

      // Dock items
      const dockItems = doc.querySelectorAll('.dock-item');
      const dockLabels = [h.dockPractice, h.dockProtect, h.dockNews, h.dockCaregiver];
      for (let i = 1; i <= 4; i++) {
        const spanLabel = dockItems[i]?.querySelector('span:last-child');
        if (spanLabel && dockLabels[i - 1]) {
          spanLabel.textContent = dockLabels[i - 1];
        }
      }

      // Explore CTA
      const exploreLabel = doc.querySelector('.liquid-button--explore .lbl');
      if (exploreLabel) exploreLabel.textContent = h.exploreCta;

      // Play button aria
      const playBtn = doc.querySelector('.liquid-button--play');
      if (playBtn) playBtn.setAttribute('aria-label', h.playAria);

      // Stats
      const statA = doc.querySelector('.stat--a');
      if (statA) {
        const dt = statA.querySelector('dt');
        const dd = statA.querySelector('dd');
        if (dt) dt.textContent = h.stat1Label;
        if (dd) dd.textContent = h.stat1Value;
      }
      const statB = doc.querySelector('.stat--b');
      if (statB) {
        const dt = statB.querySelector('dt');
        const dd = statB.querySelector('dd');
        if (dt) dt.textContent = h.stat2Label;
        if (dd) dd.textContent = h.stat2Value;
      }

      // Cards
      const cardAbout = doc.querySelector('.card--about');
      if (cardAbout) {
        const lbl = cardAbout.querySelector('.label');
        const h2 = cardAbout.querySelector('h2');
        if (lbl) lbl.textContent = h.card1Label;
        if (h2) h2.textContent = h.card1Title;
      }
      const cardStove = doc.querySelector('.card--stove');
      if (cardStove) {
        const lbl = cardStove.querySelector('.label');
        const h2 = cardStove.querySelector('h2');
        if (lbl) lbl.textContent = h.card2Label;
        if (h2) h2.textContent = h.card2Title;
      }

      // Discover link
      const scrollEl = doc.querySelector('.scroll');
      if (scrollEl && scrollEl.firstChild) {
        scrollEl.firstChild.textContent = h.discover;
      }

      // Wire interactive clicks once
      if (!doc.documentElement.dataset.surakshaBound) {
        doc.documentElement.dataset.surakshaBound = '1';

        const preventAndGo = (el: Element | null, fn: () => void) => {
          el?.addEventListener('click', (e) => {
            e.preventDefault();
            fn();
          });
        };

        preventAndGo(dockItems[0], () => callbacksRef.current.onNavigateSection('workspace'));
        preventAndGo(dockItems[1], () => callbacksRef.current.onNavigateSection('scam-gym'));
        preventAndGo(dockItems[2], () => callbacksRef.current.onNavigateSection('protect'));
        preventAndGo(dockItems[3], () => callbacksRef.current.onNavigateSection('news'));
        preventAndGo(dockItems[4], () => callbacksRef.current.onSwitchToCaregiver());

        preventAndGo(doc.querySelector('.liquid-button--explore'), () =>
          callbacksRef.current.onNavigateSection('scam-gym'),
        );
        preventAndGo(doc.querySelector('.liquid-button--play'), () =>
          callbacksRef.current.onOpenVoiceAssistant(),
        );
        preventAndGo(doc.querySelector('.scroll'), () =>
          callbacksRef.current.onNavigateSection('workspace'),
        );
        preventAndGo(doc.querySelector('.knob--about'), () =>
          callbacksRef.current.onNavigateSection('scam-gym'),
        );
        preventAndGo(doc.querySelector('.card--stove .knob'), () =>
          callbacksRef.current.onNavigateSection('protect'),
        );
      }
    };

    const iframe = container.querySelector('iframe');
    if (iframe) {
      iframe.addEventListener('load', syncHeroDocument);
      syncHeroDocument();
      const timer = window.setTimeout(syncHeroDocument, 450);
      return () => {
        iframe.removeEventListener('load', syncHeroDocument);
        window.clearTimeout(timer);
      };
    }
  }, [lang, t]);

  return (
    <section id="hero-top" className="relative w-full bg-[#0b131e]">
      <div ref={wrapRef} className="shader-frame">
        <SylvaHero
          variant="living-green"
          headingFont="lexend"
          bodyFont="lexend"
          headingWeight="300"
          bodyWeight="300"
          primaryColor="#ffffff"
          headingSize={63}
          bodySize={16.5}
          headingLetterSpacing={-0.006}
        />
      </div>

      {/* Top-Left Brand Badge on Front Page */}
      <a
        href="#workspace"
        data-testid="hero-brand-badge"
        className="hero-float-enter pointer-events-auto absolute top-5 left-5 z-20 hidden items-center gap-2 rounded-2xl border border-[#38bdf8]/35 bg-[#0d1724]/92 px-3.5 py-2 text-sm font-semibold tracking-tight text-white shadow-[0_16px_44px_rgba(0,0,0,0.52)] transition-colors hover:border-[#38bdf8]/60 xl:inline-flex"
      >
        <ShieldCheck className="h-4 w-4 shrink-0 text-[#38bdf8]" aria-hidden="true" />
        <span>{t.brandName}</span>
      </a>

      {/* Floating Pop-Up Front-Page Quick Controls: Language, Sign In, Ask Saathi */}
      <div
        data-testid="hero-floating-bar"
        className="hero-float-enter pointer-events-auto absolute top-[74px] left-1/2 z-20 flex w-[calc(100%-24px)] max-w-[440px] -translate-x-1/2 flex-wrap items-center justify-center gap-1.5 rounded-2xl border border-[#38bdf8]/35 bg-[#0d1724]/92 p-1.5 shadow-[0_16px_44px_rgba(0,0,0,0.52)] xl:top-5 xl:right-5 xl:left-auto xl:w-auto xl:max-w-none xl:translate-x-0 xl:flex-nowrap xl:px-2 xl:py-1.5"
      >
        {/* Language Switcher */}
        <label className="relative inline-flex items-center">
          <Globe
            className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-[#38bdf8]"
            aria-hidden="true"
          />
          <select
            aria-label={t.hero.floatingLanguage}
            data-testid="hero-language-select"
            value={lang}
            onChange={(e) => onChangeLang(e.target.value as LanguageCode)}
            className="cursor-pointer rounded-xl border border-white/15 bg-[#152336] py-1.5 pr-2 pl-7 text-xs font-medium text-[#f1f5f9] transition-colors hover:border-[#38bdf8]/50 focus:border-[#38bdf8] focus:outline-none"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.nativeLabel}
              </option>
            ))}
          </select>
        </label>

        {/* Sign In / Caregiver Profile Button */}
        <button
          type="button"
          data-testid="hero-signin-btn"
          onClick={onOpenSetup}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-white transition-all hover:-translate-y-0.5 hover:border-[#38bdf8]/60 hover:bg-white/14"
        >
          {profile ? (
            <UserCheck className="h-3.5 w-3.5 text-[#34d399]" aria-hidden="true" />
          ) : (
            <LogIn className="h-3.5 w-3.5 text-[#38bdf8]" aria-hidden="true" />
          )}
          <span>{profile ? t.hero.floatingSignedIn : t.hero.floatingSignIn}</span>
        </button>

        {/* Ask Saathi AI Button */}
        <button
          type="button"
          data-testid="hero-ask-saathi-btn"
          onClick={onOpenVoiceAssistant}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#38bdf8] px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap text-[#08121c] shadow-[0_6px_18px_rgba(56,189,248,0.35)] transition-all hover:-translate-y-0.5 hover:bg-[#5cccfb]"
        >
          <Mic className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{t.hero.floatingAskSaathi}</span>
        </button>
      </div>
    </section>
  );
}
