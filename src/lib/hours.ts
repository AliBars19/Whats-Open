export type DayHours = { open: string; close: string } | null;

export type OpeningHours = {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
};

type DayName =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

type OpenStatus = {
  isOpen: boolean;
  closesAt: string | null;
  opensAt: string | null;
  status: "open" | "closed" | "unknown";
};

export type DisplayStatus = {
  displayStatus:
    | "open"
    | "closed"
    | "reported_closed"
    | "reported_open"
    | "unknown";
  confidence: "high" | "medium" | "low";
  statusText: string;
};

function getLondonTime(): Date {
  const now = new Date();
  const londonStr = now.toLocaleString("en-GB", { timeZone: "Europe/London" });
  // Parse "DD/MM/YYYY, HH:MM:SS"
  const [datePart, timePart] = londonStr.split(", ");
  const [day, month, year] = datePart.split("/").map(Number);
  const [hour, minute, second] = timePart.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute, second);
}

export function getDayName(date?: Date): DayName {
  const d = date || getLondonTime();
  const days: DayName[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  return days[d.getDay()];
}

function getNextDay(day: DayName): DayName {
  const days: DayName[] = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  const idx = days.indexOf(day);
  return days[(idx + 1) % 7];
}

function getPreviousDay(day: DayName): DayName {
  const days: DayName[] = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  const idx = days.indexOf(day);
  return days[(idx + 6) % 7];
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function is24Hours(hours: DayHours): boolean {
  if (!hours) return false;
  return hours.open === "00:00" && hours.close === "23:59";
}

function closesAfterMidnight(hours: DayHours): boolean {
  if (!hours) return false;
  return timeToMinutes(hours.close) < timeToMinutes(hours.open);
}

export function formatHoursForDay(hours: DayHours): string {
  if (!hours) return "Closed";
  if (is24Hours(hours)) return "24 Hours";

  return `${formatTimeShort(hours.open)} – ${formatTimeShort(hours.close)}`;
}

function formatTimeShort(time24: string): string {
  const [hourStr, minuteStr] = time24.split(":");
  const hour = parseInt(hourStr, 10);
  const minute = minuteStr || "00";

  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour || 12;

  if (minute === "00") return `${displayHour}${period.toLowerCase()}`;
  return `${displayHour}:${minute}${period.toLowerCase()}`;
}

export function isOpenNow(openingHours: OpeningHours, testNow?: Date): OpenStatus {
  if (!openingHours || Object.keys(openingHours).length === 0) {
    return { isOpen: false, closesAt: null, opensAt: null, status: "unknown" };
  }

  const now = testNow || getLondonTime();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const today = getDayName(now);
  const todayHours = openingHours[today];

  // Check if we're in an after-midnight window from yesterday
  const yesterday = getPreviousDay(today);
  const yesterdayHours = openingHours[yesterday];

  if (yesterdayHours && closesAfterMidnight(yesterdayHours)) {
    const closeMinutes = timeToMinutes(yesterdayHours.close);
    if (currentMinutes < closeMinutes) {
      return {
        isOpen: true,
        closesAt: formatTimeShort(yesterdayHours.close),
        opensAt: null,
        status: "open",
      };
    }
  }

  // Check today's hours
  if (!todayHours) {
    // Closed today — find next opening
    const nextOpen = findNextOpening(openingHours, today);
    return {
      isOpen: false,
      closesAt: null,
      opensAt: nextOpen,
      status: "closed",
    };
  }

  if (is24Hours(todayHours)) {
    return {
      isOpen: true,
      closesAt: null,
      opensAt: null,
      status: "open",
    };
  }

  const openMinutes = timeToMinutes(todayHours.open);
  const closeMinutes = timeToMinutes(todayHours.close);

  if (closesAfterMidnight(todayHours)) {
    // Opens today, closes after midnight tomorrow
    if (currentMinutes >= openMinutes) {
      return {
        isOpen: true,
        closesAt: formatTimeShort(todayHours.close),
        opensAt: null,
        status: "open",
      };
    }
  } else {
    // Normal hours — same day open and close
    if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
      return {
        isOpen: true,
        closesAt: formatTimeShort(todayHours.close),
        opensAt: null,
        status: "open",
      };
    }
  }

  // Currently closed
  if (currentMinutes < openMinutes) {
    return {
      isOpen: false,
      closesAt: null,
      opensAt: `${formatTimeShort(todayHours.open)} today`,
      status: "closed",
    };
  }

  const nextOpen = findNextOpening(openingHours, today);
  return {
    isOpen: false,
    closesAt: null,
    opensAt: nextOpen,
    status: "closed",
  };
}

function findNextOpening(hours: OpeningHours, fromDay: DayName): string | null {
  let day = getNextDay(fromDay);
  for (let i = 0; i < 7; i++) {
    const dayHours = hours[day];
    if (dayHours) {
      const dayLabel = i === 0 ? "tomorrow" : day.charAt(0).toUpperCase() + day.slice(1);
      return `${formatTimeShort(dayHours.open)} ${dayLabel}`;
    }
    day = getNextDay(day);
  }
  return null;
}

export function getStatusWithCheckins(
  openingHours: OpeningHours,
  recentCheckinsOpen: number,
  recentCheckinsClosed: number
): DisplayStatus {
  const scheduled = isOpenNow(openingHours);

  if (scheduled.status === "unknown") {
    if (recentCheckinsOpen >= 2) {
      return {
        displayStatus: "reported_open",
        confidence: "low",
        statusText: `Reported Open by ${recentCheckinsOpen} ${recentCheckinsOpen === 1 ? "student" : "students"}`,
      };
    }
    if (recentCheckinsClosed >= 2) {
      return {
        displayStatus: "reported_closed",
        confidence: "low",
        statusText: `Reported Closed by ${recentCheckinsClosed} ${recentCheckinsClosed === 1 ? "student" : "students"}`,
      };
    }
    return {
      displayStatus: "unknown",
      confidence: "low",
      statusText: "Hours unknown",
    };
  }

  if (scheduled.isOpen) {
    if (recentCheckinsClosed >= 2) {
      return {
        displayStatus: "reported_closed",
        confidence: "medium",
        statusText: `Reported Closed by ${recentCheckinsClosed} students`,
      };
    }
    const closesText = scheduled.closesAt
      ? ` · Closes at ${scheduled.closesAt}`
      : "";
    return {
      displayStatus: "open",
      confidence: "high",
      statusText: `Open${closesText}`,
    };
  }

  // Scheduled closed
  if (recentCheckinsOpen >= 2) {
    return {
      displayStatus: "reported_open",
      confidence: "medium",
      statusText: `Reported Open by ${recentCheckinsOpen} students`,
    };
  }

  const opensText = scheduled.opensAt
    ? ` · Opens ${scheduled.opensAt}`
    : "";
  return {
    displayStatus: "closed",
    confidence: "high",
    statusText: `Closed${opensText}`,
  };
}
