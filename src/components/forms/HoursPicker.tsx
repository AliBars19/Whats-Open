"use client";

import { DAYS_OF_WEEK, TIME_SLOTS } from "@/lib/constants";
import type { OpeningHours, DayHours } from "@/lib/hours";

type HoursPickerProps = {
  value: OpeningHours;
  onChange: (hours: OpeningHours) => void;
};

export function HoursPicker({ value, onChange }: HoursPickerProps) {
  const updateDay = (day: string, hours: DayHours) => {
    onChange({ ...value, [day]: hours });
  };

  const toggleDay = (day: string) => {
    const current = value[day as keyof OpeningHours];
    if (current) {
      updateDay(day, null);
    } else {
      updateDay(day, { open: "09:00", close: "17:00" });
    }
  };

  const toggle24h = (day: string) => {
    const current = value[day as keyof OpeningHours];
    if (current?.open === "00:00" && current?.close === "23:59") {
      updateDay(day, { open: "09:00", close: "17:00" });
    } else {
      updateDay(day, { open: "00:00", close: "23:59" });
    }
  };

  const copyMondayToAll = () => {
    const monday = value.monday;
    if (!monday) return;
    const newHours: OpeningHours = {};
    for (const day of DAYS_OF_WEEK) {
      newHours[day] = monday ? { ...monday } : null;
    }
    onChange(newHours);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={copyMondayToAll}
          className="text-xs text-accent-primary hover:underline"
        >
          Copy Monday to all
        </button>
      </div>

      {DAYS_OF_WEEK.map((day) => {
        const hours = value[day as keyof OpeningHours] ?? null;
        const isOpen = hours !== null && hours !== undefined;
        const is24 = hours?.open === "00:00" && hours?.close === "23:59";

        return (
          <div key={day} className="bg-bg-elevated rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-text-primary capitalize">{day}</span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={is24}
                    onChange={() => toggle24h(day)}
                    className="rounded border-border-subtle"
                    disabled={!isOpen}
                  />
                  <span className="text-xs text-text-muted">24hr</span>
                </label>
                <button
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors
                    ${isOpen
                      ? "bg-accent-green/15 text-accent-green"
                      : "bg-accent-red/15 text-accent-red"
                    }`}
                >
                  {isOpen ? "Open" : "Closed"}
                </button>
              </div>
            </div>

            {isOpen && !is24 && (
              <div className="flex items-center gap-2">
                <select
                  value={hours?.open || "09:00"}
                  onChange={(e) => updateDay(day, { open: e.target.value, close: hours?.close || "17:00" })}
                  className="flex-1 h-9 px-2 rounded-lg bg-bg-input border border-border-subtle text-xs text-text-primary"
                >
                  {TIME_SLOTS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <span className="text-text-muted text-xs">to</span>
                <select
                  value={hours?.close || "17:00"}
                  onChange={(e) => updateDay(day, { open: hours?.open || "09:00", close: e.target.value })}
                  className="flex-1 h-9 px-2 rounded-lg bg-bg-input border border-border-subtle text-xs text-text-primary"
                >
                  {TIME_SLOTS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
