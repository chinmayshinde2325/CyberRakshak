import { Globe, Mic, PhoneCall, PlusCircle, ShieldCheck, UserCheck, Users } from 'lucide-react';
import type { AppMode, FamilyProfile, LanguageCode } from '../types/suraksha';
import { LANGUAGES, type TranslationStrings } from '../utils/i18n';

interface CommandBarProps {
  t: TranslationStrings;
  lang: LanguageCode;
  mode: AppMode;
  profile: FamilyProfile | null;
  onChangeLang: (lang: LanguageCode) => void;
  onChangeMode: (mode: AppMode) => void;
  onOpenSetup: () => void;
  onOpenAssistant: () => void;
  onOpenSiteUpdates: () => void;
  onNavigateSection: (id: string) => void;
}

export function CommandBar({
  t,
  lang,
  mode,
  profile,
  onChangeLang,
  onChangeMode,
  onOpenSetup,
  onOpenAssistant,
  onOpenSiteUpdates,
  onNavigateSection,
}: CommandBarProps) {
  return (
    <header
      id="workspace"
      className="sticky top-0 z-30 border-b border-white/10 bg-[#0d1724]/95 text-[#f1f5f9]"
    >
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-2 px-3 py-2 sm:px-4">
        {/* Zone 1: Wordmark + Primary Nav */}
        <div className="flex items-center gap-2 xl:gap-3">
          <a
            href="#hero-top"
            className="flex items-center gap-1.5 whitespace-nowrap text-base font-semibold tracking-tight text-white"
          >
            <ShieldCheck className="h-5 w-5 shrink-0 text-[#38bdf8]" aria-hidden="true" />
            <span>{t.brandName}</span>
          </a>

          <nav className="hidden items-center gap-2 text-xs font-medium text-[#d4d8cc] lg:flex" aria-label="Workspace">
            <button
              type="button"
              onClick={() => onNavigateSection('protect')}
              className="cursor-pointer whitespace-nowrap transition-colors hover:text-white"
            >
              {t.hero.dockProtect}
            </button>
            <button
              type="button"
              onClick={() => onNavigateSection('scam-gym')}
              className="cursor-pointer whitespace-nowrap transition-colors hover:text-white"
            >
              {t.hero.dockPractice}
            </button>
            <button
              type="button"
              onClick={() => onNavigateSection('news')}
              className="cursor-pointer whitespace-nowrap transition-colors hover:text-white"
            >
              {t.hero.dockNews}
            </button>
            <button
              type="button"
              onClick={() => {
                onChangeMode('caregiver');
                onNavigateSection('caregiver');
              }}
              className="cursor-pointer whitespace-nowrap transition-colors hover:text-white"
            >
              {t.hero.dockCaregiver}
            </button>
          </nav>
        </div>

        {/* Zone 2 & 3: Mode Switcher, Regional Language Switcher, Site Updates, Setup & Voice CTA */}
        <div className="flex flex-wrap items-center gap-1">
          {/* Senior / Caregiver Mode Switcher */}
          <div
            className="inline-flex shrink-0 rounded-lg border border-white/15 bg-[#1c1f19] p-0.5"
            role="group"
            aria-label={t.commandBar.modeLabel}
          >
            <button
              type="button"
              data-testid="mode-senior-btn"
              onClick={() => onChangeMode('senior')}
              className={`inline-flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                mode === 'senior'
                  ? 'bg-[#f2f3ef] text-[#23261f]'
                  : 'text-[#c9cec0] hover:text-white'
              }`}
            >
              <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t.commandBar.seniorMode}</span>
            </button>
            <button
              type="button"
              data-testid="mode-caregiver-btn"
              onClick={() => onChangeMode('caregiver')}
              className={`inline-flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                mode === 'caregiver'
                  ? 'bg-[#dd8940] text-[#1c1f19]'
                  : 'text-[#c9cec0] hover:text-white'
              }`}
            >
              <Users className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t.commandBar.caregiverMode}</span>
            </button>
          </div>

          {/* 5-Language Switcher (Default + Nagpur/Vidarbha Regional) */}
          <div className="relative inline-flex items-center">
            <Globe className="pointer-events-none absolute left-2 h-3.5 w-3.5 text-[#38bdf8]" aria-hidden="true" />
            <select
              aria-label={t.commandBar.languageLabel}
              data-testid="language-select"
              value={lang}
              onChange={(e) => onChangeLang(e.target.value as LanguageCode)}
              className="max-w-[110px] cursor-pointer truncate rounded-lg border border-white/15 bg-[#152336] py-1.5 pr-1.5 pl-6 text-xs font-medium text-[#f1f5f9] focus:border-[#38bdf8] focus:outline-none"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.nativeLabel} ({l.regionHint})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            data-testid="open-site-updates-btn"
            onClick={onOpenSiteUpdates}
            className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#38bdf8]/35 bg-[#122438] px-2 py-1.5 text-xs font-medium whitespace-nowrap text-[#bae6fd] transition-colors hover:bg-[#19324d]"
          >
            <PlusCircle className="h-3.5 w-3.5 text-[#38bdf8]" aria-hidden="true" />
            <span>{t.siteUpdates.openStudioBtn}</span>
          </button>

          <button
            type="button"
            data-testid="family-setup-btn"
            onClick={onOpenSetup}
            className="cursor-pointer rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-xs font-medium whitespace-nowrap text-[#f1f5f9] transition-colors hover:bg-white/10"
          >
            {profile ? t.commandBar.editProfileBtn : t.commandBar.setupProfileBtn}
          </button>

          <a
            href="tel:1930"
            className="inline-flex items-center gap-1 rounded-lg border border-[#c63d2f]/60 bg-[#c63d2f]/20 px-2 py-1.5 text-xs font-semibold whitespace-nowrap text-[#ffd8d3] transition-colors hover:bg-[#c63d2f]/35"
          >
            <PhoneCall className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t.commandBar.helpline1930}</span>
          </a>

          <button
            type="button"
            data-testid="open-assistant-btn"
            onClick={onOpenAssistant}
            className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-[#38bdf8] px-2 py-1.5 text-xs font-semibold whitespace-nowrap text-[#08121c] transition-colors hover:bg-[#5cccfb]"
          >
            <Mic className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t.commandBar.askVoiceBtn}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
