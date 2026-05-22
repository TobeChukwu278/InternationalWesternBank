"use client";

import { useLocale } from "@/i18n/client";

interface ScheduleToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  date: string;
  onDateChange: (date: string) => void;
}

export function ScheduleToggle({ enabled, onToggle, date, onDateChange }: ScheduleToggleProps) {
  const { t } = useLocale();
  return (
    <div className="rounded-iwb-lg border border-iwb-border-light p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <i className="material-icons text-iwb-slate-light">event_repeat</i>
          <div>
            <p className="text-sm font-medium text-iwb-navy">{t('send.scheduleLater')}</p>
            <p className="text-xs text-iwb-slate">Send this transfer automatically in the future</p>
          </div>
        </div>
        <button
          role="switch"
          aria-checked={enabled}
          onClick={() => onToggle(!enabled)}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
            enabled ? "bg-iwb-teal" : "bg-iwb-border"
          }`}
        >
          <span
            className={`inline-block size-4 rounded-full bg-white shadow-sm transition-transform ${
              enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
      {enabled ? (
        <div className="mt-4">
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            className="w-full rounded-iwb-md border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
          />
        </div>
      ) : null}
    </div>
  );
}
