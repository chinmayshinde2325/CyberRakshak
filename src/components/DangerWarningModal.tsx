import { ExternalLink, PhoneCall, ShieldAlert, UserPlus, X } from 'lucide-react';
import type { CaregiverAlert } from '../types/suraksha';
import type { TranslationStrings } from '../utils/i18n';

interface DangerWarningModalProps {
  alert: CaregiverAlert | null;
  t: TranslationStrings;
  onDismiss: () => void;
  onOpenSetup: () => void;
}

export function DangerWarningModal({
  alert,
  t,
  onDismiss,
  onOpenSetup,
}: DangerWarningModalProps) {
  if (!alert) return null;
  const w = t.warningModal;
  const hasCaregiver = Boolean(alert.caregiverPhone && alert.whatsappUrl);

  return (
    <div
      data-testid="danger-warning-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="danger-modal-title"
    >
      <div className="w-full max-w-lg rounded-2xl border-2 border-[#c63d2f] bg-[#fdf5f4] p-6 text-[#23261f] shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#c63d2f] text-white">
              <ShieldAlert className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h2 id="danger-modal-title" className="text-xl font-bold text-[#8d1f15]">
                {w.title}
              </h2>
              <p className="text-xs font-semibold text-[#7c352d]">
                {hasCaregiver ? w.whatsappPrepared : w.blockedTargetLabel}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            aria-label={w.dismissBtn}
            className="cursor-pointer rounded-lg p-1.5 text-[#5a3b37] hover:bg-black/5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-[#c63d2f]/25 bg-white p-4">
          <p className="text-xs font-semibold text-[#7c352d] uppercase">{w.blockedTargetLabel}</p>
          <p className="mt-1 break-all text-sm font-semibold text-[#23261f]">{alert.targetSummary}</p>
          <p className="mt-2 text-sm text-[#4f5448]">{alert.maskedReason}</p>
        </div>

        {hasCaregiver ? (
          <div className="mt-4 rounded-xl border border-[#1d7a46]/30 bg-[#eef7f1] p-3.5 text-xs font-medium text-[#175532]">
            {w.whatsappSentBanner} ({alert.caregiverName} · +91 {alert.caregiverPhone})
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-[#d98b26]/35 bg-[#fdf8ef] p-3.5 text-xs font-medium text-[#7c4d0b]">
            {w.guestBanner}
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          {hasCaregiver ? (
            <a
              href={alert.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="modal-whatsapp-link"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1d7a46] px-4 py-3 text-sm font-semibold text-white hover:bg-[#166137]"
            >
              <span>{w.openWhatsappBtn}</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : (
            <button
              type="button"
              data-testid="modal-add-caregiver-btn"
              onClick={() => {
                onDismiss();
                onOpenSetup();
              }}
              className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0f4c5c] px-4 py-3 text-sm font-semibold text-white hover:bg-[#156074]"
            >
              <UserPlus className="h-4 w-4" />
              <span>{w.addCaregiverBtn}</span>
            </button>
          )}

          <a
            href="tel:1930"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#c63d2f] px-4 py-3 text-sm font-semibold text-white hover:bg-[#a82e22]"
          >
            <PhoneCall className="h-4 w-4" />
            <span>{w.call1930Btn}</span>
          </a>
        </div>

        <button
          type="button"
          data-testid="danger-modal-dismiss"
          onClick={onDismiss}
          className="mt-3 w-full cursor-pointer rounded-xl border border-[#23261f]/15 bg-white py-2.5 text-sm font-medium text-[#3b4035] hover:bg-black/5"
        >
          {w.dismissBtn}
        </button>
      </div>
    </div>
  );
}
