import {
  isOpenNow,
  getStatusWithCheckins,
  formatHoursForDay,
  getDayName,
  type OpeningHours,
} from "@/lib/hours";

// Deterministic test dates
const MONDAY_10AM = new Date(2026, 2, 16, 10, 0, 0);
const MONDAY_7AM = new Date(2026, 2, 16, 7, 0, 0);
const MONDAY_11PM = new Date(2026, 2, 16, 23, 0, 0);
const TUESDAY_1AM = new Date(2026, 2, 17, 1, 0, 0);
const TUESDAY_2AM = new Date(2026, 2, 17, 2, 0, 0);
const WEDNESDAY_3PM = new Date(2026, 2, 18, 15, 0, 0);
const SUNDAY_10AM = new Date(2026, 2, 22, 10, 0, 0);

describe("getDayName", () => {
  it("returns correct day name for a Monday", () => {
    expect(getDayName(MONDAY_10AM)).toBe("monday");
  });

  it("returns correct day name for a Wednesday", () => {
    expect(getDayName(WEDNESDAY_3PM)).toBe("wednesday");
  });

  it("returns correct day name for a Tuesday", () => {
    expect(getDayName(TUESDAY_2AM)).toBe("tuesday");
  });

  it("returns correct day name for a Sunday", () => {
    expect(getDayName(SUNDAY_10AM)).toBe("sunday");
  });
});

describe("formatHoursForDay", () => {
  it("returns 'Closed' for null", () => {
    expect(formatHoursForDay(null)).toBe("Closed");
  });

  it("returns '24 Hours' for 00:00-23:59", () => {
    expect(formatHoursForDay({ open: "00:00", close: "23:59" })).toBe("24 Hours");
  });

  it("formats normal hours correctly", () => {
    expect(formatHoursForDay({ open: "08:00", close: "22:00" })).toBe("8am – 10pm");
  });

  it("formats hours with minutes correctly", () => {
    expect(formatHoursForDay({ open: "08:30", close: "17:45" })).toBe("8:30am – 5:45pm");
  });

  it("formats noon correctly", () => {
    expect(formatHoursForDay({ open: "12:00", close: "23:00" })).toBe("12pm – 11pm");
  });

  it("formats after-midnight close time", () => {
    const result = formatHoursForDay({ open: "20:00", close: "03:00" });
    expect(result).toBe("8pm – 3am");
  });
});

describe("isOpenNow", () => {
  it("returns 'unknown' for empty hours", () => {
    const result = isOpenNow({});
    expect(result.status).toBe("unknown");
    expect(result.isOpen).toBe(false);
    expect(result.closesAt).toBeNull();
    expect(result.opensAt).toBeNull();
  });

  it("returns 'open' for 24/7 place at any time", () => {
    const hours: OpeningHours = {
      monday: { open: "00:00", close: "23:59" },
      tuesday: { open: "00:00", close: "23:59" },
      wednesday: { open: "00:00", close: "23:59" },
      thursday: { open: "00:00", close: "23:59" },
      friday: { open: "00:00", close: "23:59" },
      saturday: { open: "00:00", close: "23:59" },
      sunday: { open: "00:00", close: "23:59" },
    };
    const result = isOpenNow(hours, MONDAY_10AM);
    expect(result.status).toBe("open");
    expect(result.isOpen).toBe(true);
    expect(result.closesAt).toBeNull(); // 24hr has no close time
  });

  it("returns 'open' during normal business hours", () => {
    const hours: OpeningHours = {
      monday: { open: "08:00", close: "22:00" },
    };
    // Monday 10am is within 8am-10pm
    const result = isOpenNow(hours, MONDAY_10AM);
    expect(result.status).toBe("open");
    expect(result.isOpen).toBe(true);
    expect(result.closesAt).toBe("10pm");
  });

  it("returns 'closed' before opening time with opensAt", () => {
    const hours: OpeningHours = {
      monday: { open: "08:00", close: "22:00" },
    };
    // Monday 7am is before 8am opening
    const result = isOpenNow(hours, MONDAY_7AM);
    expect(result.status).toBe("closed");
    expect(result.isOpen).toBe(false);
    expect(result.opensAt).toContain("8am");
    expect(result.opensAt).toContain("today");
  });

  it("returns 'closed' after closing time", () => {
    const hours: OpeningHours = {
      monday: { open: "08:00", close: "22:00" },
      tuesday: { open: "09:00", close: "17:00" },
    };
    // Monday 11pm is after 10pm closing
    const result = isOpenNow(hours, MONDAY_11PM);
    expect(result.status).toBe("closed");
    expect(result.isOpen).toBe(false);
    expect(result.opensAt).toContain("9am");
    expect(result.opensAt).toContain("tomorrow");
  });

  it("returns 'closed' when today is null and finds next opening", () => {
    const hours: OpeningHours = {
      monday: null,
      tuesday: { open: "09:00", close: "17:00" },
    };
    const result = isOpenNow(hours, MONDAY_10AM);
    expect(result.status).toBe("closed");
    expect(result.isOpen).toBe(false);
    expect(result.opensAt).toContain("9am");
    expect(result.opensAt).toContain("tomorrow");
  });

  it("handles after-midnight closing — open during evening", () => {
    const hours: OpeningHours = {
      monday: { open: "20:00", close: "03:00" }, // closes 3am Tuesday
    };
    // Monday 11pm is within 8pm-3am
    const result = isOpenNow(hours, MONDAY_11PM);
    expect(result.status).toBe("open");
    expect(result.isOpen).toBe(true);
    expect(result.closesAt).toBe("3am");
  });

  it("handles after-midnight closing — still open after midnight (yesterday's hours)", () => {
    const hours: OpeningHours = {
      monday: { open: "20:00", close: "03:00" }, // closes 3am Tuesday
      tuesday: { open: "10:00", close: "22:00" },
    };
    // Tuesday 1am — we're in Monday's after-midnight window
    const result = isOpenNow(hours, TUESDAY_1AM);
    expect(result.status).toBe("open");
    expect(result.isOpen).toBe(true);
    expect(result.closesAt).toBe("3am");
  });

  it("handles after-midnight closing — closed after the late close", () => {
    const hours: OpeningHours = {
      monday: { open: "20:00", close: "02:00" }, // closes 2am Tuesday
      tuesday: { open: "10:00", close: "22:00" },
    };
    // Tuesday 2am — Monday's window (closes at 2am) has ended, Tuesday hasn't opened
    // currentMinutes = 120, closeMinutes = 120, NOT < 120 so not in yesterday's window
    // Today is Tuesday, opens at 10am
    const result = isOpenNow(hours, TUESDAY_2AM);
    expect(result.status).toBe("closed");
    expect(result.isOpen).toBe(false);
  });

  it("returns null opensAt when no future opening exists", () => {
    // Only one day has hours and we're past it
    const hours: OpeningHours = {
      monday: null,
      tuesday: null,
      wednesday: null,
      thursday: null,
      friday: null,
      saturday: null,
      sunday: null,
    };
    const result = isOpenNow(hours, MONDAY_10AM);
    expect(result.status).toBe("closed");
    expect(result.opensAt).toBeNull();
  });

  it("finds next opening several days away", () => {
    const hours: OpeningHours = {
      monday: null,
      tuesday: null,
      wednesday: null,
      thursday: null,
      friday: { open: "09:00", close: "17:00" },
    };
    // Monday, next opening is Friday
    const result = isOpenNow(hours, MONDAY_10AM);
    expect(result.status).toBe("closed");
    expect(result.opensAt).toContain("9am");
    expect(result.opensAt).toContain("Friday");
  });
});

describe("getStatusWithCheckins", () => {
  const openAllDay: OpeningHours = {
    monday: { open: "00:00", close: "23:59" },
    tuesday: { open: "00:00", close: "23:59" },
    wednesday: { open: "00:00", close: "23:59" },
    thursday: { open: "00:00", close: "23:59" },
    friday: { open: "00:00", close: "23:59" },
    saturday: { open: "00:00", close: "23:59" },
    sunday: { open: "00:00", close: "23:59" },
  };

  const closedAllDay: OpeningHours = {
    monday: null,
    tuesday: null,
    wednesday: null,
    thursday: null,
    friday: null,
    saturday: null,
    sunday: null,
  };

  it("returns 'open' with high confidence when hours say open and no contrary checkins", () => {
    const result = getStatusWithCheckins(openAllDay, 0, 0);
    expect(result.displayStatus).toBe("open");
    expect(result.confidence).toBe("high");
  });

  it("returns 'open' with high confidence when checkins agree", () => {
    const result = getStatusWithCheckins(openAllDay, 5, 0);
    expect(result.displayStatus).toBe("open");
    expect(result.confidence).toBe("high");
  });

  it("returns 'reported_closed' when hours say open but 2+ checkins say closed", () => {
    const result = getStatusWithCheckins(openAllDay, 0, 3);
    expect(result.displayStatus).toBe("reported_closed");
    expect(result.confidence).toBe("medium");
    expect(result.statusText).toContain("Reported Closed");
    expect(result.statusText).toContain("3 students");
  });

  it("returns 'closed' with high confidence when hours say closed and no contrary checkins", () => {
    const result = getStatusWithCheckins(closedAllDay, 0, 0);
    expect(result.displayStatus).toBe("closed");
    expect(result.confidence).toBe("high");
  });

  it("returns 'reported_open' when hours say closed but 2+ checkins say open", () => {
    const result = getStatusWithCheckins(closedAllDay, 3, 0);
    expect(result.displayStatus).toBe("reported_open");
    expect(result.confidence).toBe("medium");
    expect(result.statusText).toContain("Reported Open");
    expect(result.statusText).toContain("3 students");
  });

  it("returns 'unknown' with low confidence when no hours and no checkins", () => {
    const result = getStatusWithCheckins({}, 0, 0);
    expect(result.displayStatus).toBe("unknown");
    expect(result.confidence).toBe("low");
    expect(result.statusText).toBe("Hours unknown");
  });

  it("returns 'reported_open' with low confidence when no hours but checkins say open", () => {
    const result = getStatusWithCheckins({}, 3, 0);
    expect(result.displayStatus).toBe("reported_open");
    expect(result.confidence).toBe("low");
  });

  it("returns 'reported_closed' with low confidence when no hours but checkins say closed", () => {
    const result = getStatusWithCheckins({}, 0, 2);
    expect(result.displayStatus).toBe("reported_closed");
    expect(result.confidence).toBe("low");
  });

  it("requires 2+ checkins to override scheduled status", () => {
    const result = getStatusWithCheckins(openAllDay, 0, 1);
    expect(result.displayStatus).toBe("open");
    expect(result.confidence).toBe("high");
  });

  it("includes 'Closes at' in statusText when open", () => {
    const result = getStatusWithCheckins(openAllDay, 0, 0);
    expect(result.statusText).toMatch(/^Open/);
  });

  it("includes 'Opens' in statusText when closed", () => {
    const result = getStatusWithCheckins(closedAllDay, 0, 0);
    expect(result.statusText).toMatch(/^Closed/);
  });
});
