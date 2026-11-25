import { useEffect, useState, type FormEvent } from 'react';
import {
  CheckCircle2,
  HardDrive,
  KeyRound,
  MessageSquareWarning,
  ShieldAlert,
  ShieldCheck,
  X,
} from 'lucide-react';
import type { FamilyProfile } from '../types/suraksha';
import type { TranslationStrings } from '../utils/i18n';
import { normalizeIndianPhone, validateFamilyProfileInput } from '../utils/scamEngine';

interface OnboardingGateProps {
  open: boolean;
  existingProfile: FamilyProfile | null;
  t: TranslationStrings;
  onComplete: (profile: FamilyProfile) => void;
  onClose: () => void;
}

export function OnboardingGate({
  open,
  existingProfile,
  t,
  onComplete,
  onClose,
}: OnboardingGateProps) {
  const [seniorName, setSeniorName] = useState(existingProfile?.seniorName ?? '');
  const [seniorPhone, setSeniorPhone] = useState(existingProfile?.seniorPhone ?? '');
  const [seniorEmail, setSeniorEmail] = useState(existingProfile?.seniorEmail ?? '');
  const [caregiverName, setCaregiverName] = useState(existingProfile?.caregiverName ?? '');
  const [caregiverPhone, setCaregiverPhone] = useState(existingProfile?.caregiverPhone ?? '');
  const [caregiverEmail, setCaregiverEmail] = useState(existingProfile?.caregiverEmail ?? '');
  const [whatsappAlerts, setWhatsappAlerts] = useState(
    existingProfile ? existingProfile.permissions.whatsappAlerts : true,
  );
  const [messagesScan, setMessagesScan] = useState(
    existingProfile ? existingProfile.permissions.messagesScan : true,
  );
  const [storageScan, setStorageScan] = useState(
    existingProfile ? existingProfile.permissions.storageScan : true,
  );
  const [privacyShareRawMessage, setPrivacyShareRawMessage] = useState(
    existingProfile ? existingProfile.privacyShareRawMessage : false,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Phone OTP Authentication State
  const [otpCode, setOtpCode] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpSentTo, setOtpSentTo] = useState<string | null>(null);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpFeedback, setOtpFeedback] = useState<{ type: 'info' | 'error' | 'success'; text: string } | null>(null);
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(
    existingProfile?.seniorPhoneVerified ? existingProfile.seniorPhone : null,
  );
  const [phoneAuthToken, setPhoneAuthToken] = useState<string | undefined>(
    existingProfile?.phoneAuthToken,
  );

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (otpCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setOtpCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [otpCooldown]);

  if (!open) return null;

  const ob = t.onboarding;
  const normalizedSenior = normalizeIndianPhone(seniorPhone);
  const isCurrentPhoneVerified =
    Boolean(verifiedPhone && normalizedSenior.valid && verifiedPhone === normalizedSenior.local10);

  const handleRequestOtp = async () => {
    if (!normalizedSenior.valid) {
      setOtpFeedback({ type: 'error', text: ob.errInvalidPhone });
      return;
    }
    setOtpSending(true);
    setOtpFeedback(null);

    try {
      const resp = await fetch('/api/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: seniorPhone }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        setOtpFeedback({
          type: 'error',
          text: data.smsNotConfigured
            ? `${ob.otpSecretMissingNote}`
            : data.error || 'Could not send OTP right now.',
        });
        if (typeof data.retryAfterSeconds === 'number') {
          setOtpCooldown(data.retryAfterSeconds);
        }
        return;
      }

      setOtpSentTo(data.phone || normalizedSenior.local10);
      setOtpCooldown(30);
      setOtpFeedback({
        type: 'info',
        text: `6-digit SMS OTP sent to +91 ${data.phone || normalizedSenior.local10}.`,
      });
    } catch {
      setOtpFeedback({ type: 'error', text: 'Network error requesting SMS OTP.' });
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode.trim()) return;
    setOtpVerifying(true);
    setOtpFeedback(null);

    try {
      const resp = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: seniorPhone, code: otpCode.trim() }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        setOtpFeedback({ type: 'error', text: data.error || 'Invalid OTP code.' });
        return;
      }

      setVerifiedPhone(data.phone || normalizedSenior.local10);
      setPhoneAuthToken(typeof data.token === 'string' ? data.token : undefined);
      setOtpCode('');
      setOtpSentTo(null);
      setOtpFeedback({ type: 'success', text: ob.otpVerifiedBadge });
    } catch {
      setOtpFeedback({ type: 'error', text: 'Network error verifying OTP.' });
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleFillDemo = () => {
    setSeniorName('Madhavrao Deshmukh');
    setSeniorPhone('9823011223');
    setSeniorEmail('');
    setCaregiverName('Sneha Deshmukh');
    setCaregiverPhone('9823099887');
    setCaregiverEmail('sneha.deshmukh@example.com');
    setWhatsappAlerts(true);
    setMessagesScan(true);
    setStorageScan(true);
    setErrors({});
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const result = validateFamilyProfileInput({
      seniorName,
      seniorPhone,
      seniorEmail,
      caregiverName,
      caregiverPhone,
      caregiverEmail,
      permissions: { whatsappAlerts, messagesScan, storageScan },
      privacyShareRawMessage,
    });

    if (!result.valid || !result.normalized) {
      const mapped: Record<string, string> = {};
      if (result.errors.seniorName) mapped.seniorName = ob.errRequiredName;
      if (result.errors.seniorPhone) mapped.seniorPhone = ob.errInvalidPhone;
      if (result.errors.seniorEmail) mapped.seniorEmail = ob.errInvalidEmail;
      if (result.errors.caregiverName) mapped.caregiverName = ob.errRequiredName;
      if (result.errors.caregiverPhone) mapped.caregiverPhone = ob.errInvalidPhone;
      if (result.errors.caregiverEmail) mapped.caregiverEmail = ob.errInvalidEmail;
      if (result.errors.permissions) mapped.permissions = ob.errPermission;
      setErrors(mapped);
      return;
    }

    setErrors({});
    onComplete({
      ...result.normalized,
      seniorPhoneVerified: isCurrentPhoneVerified,
      phoneAuthToken: isCurrentPhoneVerified ? phoneAuthToken : undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="my-auto w-full max-w-3xl rounded-2xl border border-[#38bdf8]/25 bg-[#f2f4f7] p-6 text-[#18202c] shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4 border-b border-[#18202c]/10 pb-4">
          <div>
            <p className="text-xs font-semibold tracking-wider text-[#0e7490] uppercase">
              {ob.eyebrow}
            </p>
            <h2 id="onboarding-title" className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              {ob.title}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-[#475569]">{ob.subtitle}</p>
          </div>
          <button
            type="button"
            data-testid="onboarding-close-btn"
            onClick={onClose}
            aria-label="Close setup"
            className="shrink-0 cursor-pointer rounded-xl border border-[#18202c]/15 bg-white p-2 text-[#18202c] shadow-sm transition-colors hover:bg-[#e2e8f0]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6" noValidate>
          <div className="grid gap-5 md:grid-cols-2">
            {/* Senior Citizen Details */}
            <fieldset className="space-y-3 rounded-xl border border-[#23261f]/12 bg-white p-4">
              <legend className="px-1 text-sm font-semibold text-[#23261f]">
                {ob.seniorSectionTitle}
              </legend>

              <div>
                <label className="block text-xs font-medium text-[#4f5448]" htmlFor="senior-name">
                  {ob.nameLabel} *
                </label>
                <input
                  id="senior-name"
                  type="text"
                  value={seniorName}
                  onChange={(e) => setSeniorName(e.target.value)}
                  placeholder={ob.seniorNamePlaceholder}
                  className="mt-1 w-full rounded-lg border border-[#23261f]/20 bg-[#f9faf7] px-3 py-2 text-sm text-[#23261f] focus:border-[#4a5d34] focus:outline-none"
                />
                {errors.seniorName && (
                  <p className="mt-1 text-xs font-medium text-[#b93829]">{errors.seniorName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4f5448]" htmlFor="senior-phone">
                  {ob.phoneLabel} *
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    id="senior-phone"
                    data-testid="senior-phone-input"
                    type="tel"
                    value={seniorPhone}
                    onChange={(e) => setSeniorPhone(e.target.value)}
                    placeholder={ob.phonePlaceholder}
                    className="min-w-0 flex-1 rounded-lg border border-[#23261f]/20 bg-[#f9faf7] px-3 py-2 text-sm text-[#23261f] focus:border-[#4a5d34] focus:outline-none"
                  />
                  <button
                    type="button"
                    data-testid="send-otp-btn"
                    disabled={otpSending || otpCooldown > 0 || !normalizedSenior.valid}
                    onClick={() => void handleRequestOtp()}
                    className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-[#0e7490]/30 bg-[#e0f2fe] px-3 py-2 text-xs font-semibold text-[#0c4a6e] hover:bg-[#bae6fd] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>
                      {otpSending
                        ? ob.sendingOtpBtn
                        : otpCooldown > 0
                          ? `${ob.resendOtpIn} ${otpCooldown}s`
                          : ob.sendOtpBtn}
                    </span>
                  </button>
                </div>
                {errors.seniorPhone && (
                  <p className="mt-1 text-xs font-medium text-[#b93829]">{errors.seniorPhone}</p>
                )}

                {/* Inline SMS OTP Verification Panel */}
                <div className="mt-2.5 rounded-lg border border-[#0e7490]/20 bg-[#f0f9ff] p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-[#0c4a6e]">
                      {ob.otpSectionTitle}
                    </span>
                    {isCurrentPhoneVerified && (
                      <span
                        data-testid="otp-verified-badge"
                        className="inline-flex items-center gap-1 rounded-md bg-[#3f7a4c]/15 px-2 py-0.5 text-[11px] font-semibold text-[#1f4d29]"
                      >
                        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                        <span>{ob.otpVerifiedBadge}</span>
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] text-[#475569]">{ob.otpHint}</p>

                  {otpSentTo && !isCurrentPhoneVerified && (
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        data-testid="otp-code-input"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder={ob.otpCodePlaceholder}
                        className="w-36 rounded-lg border border-[#0e7490]/30 bg-white px-2.5 py-1.5 text-xs font-semibold tracking-widest text-[#0f172a] focus:border-[#0e7490] focus:outline-none"
                      />
                      <button
                        type="button"
                        data-testid="verify-otp-btn"
                        disabled={otpVerifying || otpCode.length !== 6}
                        onClick={() => void handleVerifyOtp()}
                        className="cursor-pointer rounded-lg bg-[#0f4c5c] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#156074] disabled:opacity-50"
                      >
                        {otpVerifying ? ob.verifyingOtpBtn : ob.verifyOtpBtn}
                      </button>
                    </div>
                  )}

                  {otpFeedback && (
                    <p
                      data-testid="otp-feedback"
                      className={`mt-1.5 text-[11px] font-medium ${
                        otpFeedback.type === 'error'
                          ? 'text-[#9d2417]'
                          : otpFeedback.type === 'success'
                            ? 'text-[#1f4d29]'
                            : 'text-[#0c4a6e]'
                      }`}
                    >
                      {otpFeedback.text}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4f5448]" htmlFor="senior-email">
                  {ob.emailOptionalLabel}
                </label>
                <input
                  id="senior-email"
                  type="email"
                  value={seniorEmail}
                  onChange={(e) => setSeniorEmail(e.target.value)}
                  placeholder={ob.emailPlaceholder}
                  className="mt-1 w-full rounded-lg border border-[#23261f]/20 bg-[#f9faf7] px-3 py-2 text-sm text-[#23261f] focus:border-[#4a5d34] focus:outline-none"
                />
                {errors.seniorEmail && (
                  <p className="mt-1 text-xs font-medium text-[#b93829]">{errors.seniorEmail}</p>
                )}
              </div>
            </fieldset>

            {/* Caregiver Details */}
            <fieldset className="space-y-3 rounded-xl border border-[#23261f]/12 bg-white p-4">
              <legend className="px-1 text-sm font-semibold text-[#23261f]">
                {ob.caregiverSectionTitle}
              </legend>

              <div>
                <label className="block text-xs font-medium text-[#4f5448]" htmlFor="caregiver-name">
                  {ob.nameLabel} *
                </label>
                <input
                  id="caregiver-name"
                  type="text"
                  value={caregiverName}
                  onChange={(e) => setCaregiverName(e.target.value)}
                  placeholder={ob.caregiverNamePlaceholder}
                  className="mt-1 w-full rounded-lg border border-[#23261f]/20 bg-[#f9faf7] px-3 py-2 text-sm text-[#23261f] focus:border-[#4a5d34] focus:outline-none"
                />
                {errors.caregiverName && (
                  <p className="mt-1 text-xs font-medium text-[#b93829]">{errors.caregiverName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4f5448]" htmlFor="caregiver-phone">
                  {ob.phoneLabel} *
                </label>
                <input
                  id="caregiver-phone"
                  type="tel"
                  value={caregiverPhone}
                  onChange={(e) => setCaregiverPhone(e.target.value)}
                  placeholder={ob.phonePlaceholder}
                  className="mt-1 w-full rounded-lg border border-[#23261f]/20 bg-[#f9faf7] px-3 py-2 text-sm text-[#23261f] focus:border-[#4a5d34] focus:outline-none"
                />
                {errors.caregiverPhone && (
                  <p className="mt-1 text-xs font-medium text-[#b93829]">{errors.caregiverPhone}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4f5448]" htmlFor="caregiver-email">
                  {ob.emailOptionalLabel}
                </label>
                <input
                  id="caregiver-email"
                  type="email"
                  value={caregiverEmail}
                  onChange={(e) => setCaregiverEmail(e.target.value)}
                  placeholder={ob.emailPlaceholder}
                  className="mt-1 w-full rounded-lg border border-[#23261f]/20 bg-[#f9faf7] px-3 py-2 text-sm text-[#23261f] focus:border-[#4a5d34] focus:outline-none"
                />
                {errors.caregiverEmail && (
                  <p className="mt-1 text-xs font-medium text-[#b93829]">{errors.caregiverEmail}</p>
                )}
              </div>
            </fieldset>
          </div>

          {/* Clean, Non-Messy Protection Permissions */}
          <div className="rounded-xl border border-[#23261f]/12 bg-white p-4">
            <h3 className="text-sm font-semibold text-[#23261f]">{ob.permissionsSectionTitle}</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-[#23261f]/10 bg-[#f9faf7] p-3 hover:border-[#556343]">
                <input
                  type="checkbox"
                  checked={whatsappAlerts}
                  onChange={(e) => setWhatsappAlerts(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[#4a5d34]"
                />
                <div>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-[#23261f]">
                    <ShieldAlert className="h-3.5 w-3.5 text-[#dd8940]" />
                    {ob.permWhatsappTitle}
                  </span>
                  <span className="mt-1 block text-xs leading-snug text-[#5a6054]">
                    {ob.permWhatsappDesc}
                  </span>
                </div>
              </label>

              <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-[#23261f]/10 bg-[#f9faf7] p-3 hover:border-[#556343]">
                <input
                  type="checkbox"
                  checked={messagesScan}
                  onChange={(e) => setMessagesScan(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[#4a5d34]"
                />
                <div>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-[#23261f]">
                    <MessageSquareWarning className="h-3.5 w-3.5 text-[#556343]" />
                    {ob.permMessagesTitle}
                  </span>
                  <span className="mt-1 block text-xs leading-snug text-[#5a6054]">
                    {ob.permMessagesDesc}
                  </span>
                </div>
              </label>

              <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-[#23261f]/10 bg-[#f9faf7] p-3 hover:border-[#556343]">
                <input
                  type="checkbox"
                  checked={storageScan}
                  onChange={(e) => setStorageScan(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[#4a5d34]"
                />
                <div>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-[#23261f]">
                    <HardDrive className="h-3.5 w-3.5 text-[#556343]" />
                    {ob.permStorageTitle}
                  </span>
                  <span className="mt-1 block text-xs leading-snug text-[#5a6054]">
                    {ob.permStorageDesc}
                  </span>
                </div>
              </label>
            </div>

            <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs text-[#4f5448]">
              <input
                type="checkbox"
                checked={privacyShareRawMessage}
                onChange={(e) => setPrivacyShareRawMessage(e.target.checked)}
                className="h-4 w-4 accent-[#4a5d34]"
              />
              <span>{ob.privacyShareLabel}</span>
            </label>

            {errors.permissions && (
              <p className="mt-2 text-xs font-medium text-[#b93829]">{errors.permissions}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                data-testid="onboarding-demo-fill"
                onClick={handleFillDemo}
                className="cursor-pointer rounded-lg border border-[#18202c]/20 bg-white px-4 py-2 text-xs font-medium text-[#334155] hover:bg-slate-100 sm:text-sm"
              >
                {ob.demoFillBtn}
              </button>
              <button
                type="button"
                data-testid="onboarding-skip-btn"
                onClick={onClose}
                className="cursor-pointer rounded-lg border border-transparent px-3 py-2 text-xs font-medium text-[#475569] hover:bg-black/5 sm:text-sm"
              >
                {ob.skipBtn}
              </button>
            </div>

            <button
              type="submit"
              data-testid="onboarding-submit"
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#0f4c5c] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#156074] sm:text-base"
            >
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              <span>{ob.submitBtn}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
