import { DAYS_OF_WEEK } from "@/lib/constants";
import { formatHoursForDay, getDayName, type OpeningHours } from "@/lib/hours";

type HoursDisplayProps = {
  hours: OpeningHours;
};

export function HoursDisplay({ hours }: HoursDisplayProps) {
  const today = getDayName();

  if (!hours || Object.keys(hours).length === 0) {
    return (
      <p className="text-sm text-text-muted italic">No hours submitted yet</p>
    );
  }

  return (
    <div className="space-y-1">
      {DAYS_OF_WEEK.map((day) => {
        const isToday = day === today;
        const dayHours = hours[day] ?? null;

        return (
          <div
            key={day}
            className={`flex justify-between text-sm py-1 px-2 rounded-lg
              ${isToday ? "bg-accent-primary/10 text-accent-primary font-medium" : "text-text-secondary"}`}
          >
            <span className="capitalize">{day.slice(0, 3)}</span>
            <span>{formatHoursForDay(dayHours)}</span>
          </div>
        );
      })}
    </div>
  );
}
