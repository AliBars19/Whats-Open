import {
  CATEGORIES,
  FILTER_CHIPS,
  CHECKIN_RADIUS_METRES,
  STATUS_COLORS,
  DAYS_OF_WEEK,
  TIME_SLOTS,
  UK_UNIVERSITIES,
} from "@/lib/constants";

describe("CATEGORIES", () => {
  it("has 8 categories", () => {
    expect(CATEGORIES).toHaveLength(8);
  });

  it("each category has value, label, and icon", () => {
    CATEGORIES.forEach((cat) => {
      expect(cat).toHaveProperty("value");
      expect(cat).toHaveProperty("label");
      expect(cat).toHaveProperty("icon");
      expect(typeof cat.value).toBe("string");
      expect(typeof cat.label).toBe("string");
      expect(typeof cat.icon).toBe("string");
    });
  });

  it("has unique values", () => {
    const values = CATEGORIES.map((c) => c.value);
    expect(new Set(values).size).toBe(values.length);
  });
});

describe("FILTER_CHIPS", () => {
  it("first chip is 'All' with null value", () => {
    expect(FILTER_CHIPS[0]).toEqual({ value: null, label: "All" });
  });

  it("has 7 filter options", () => {
    expect(FILTER_CHIPS).toHaveLength(7);
  });
});

describe("CHECKIN_RADIUS_METRES", () => {
  it("is 200 metres", () => {
    expect(CHECKIN_RADIUS_METRES).toBe(200);
  });
});

describe("STATUS_COLORS", () => {
  it("has all 5 status colours", () => {
    expect(STATUS_COLORS).toHaveProperty("open");
    expect(STATUS_COLORS).toHaveProperty("closed");
    expect(STATUS_COLORS).toHaveProperty("reported_closed");
    expect(STATUS_COLORS).toHaveProperty("reported_open");
    expect(STATUS_COLORS).toHaveProperty("unknown");
  });

  it("all values are hex colour strings", () => {
    Object.values(STATUS_COLORS).forEach((color) => {
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });
});

describe("DAYS_OF_WEEK", () => {
  it("has 7 days", () => {
    expect(DAYS_OF_WEEK).toHaveLength(7);
  });

  it("starts with monday and ends with sunday", () => {
    expect(DAYS_OF_WEEK[0]).toBe("monday");
    expect(DAYS_OF_WEEK[6]).toBe("sunday");
  });
});

describe("TIME_SLOTS", () => {
  it("starts with 00:00", () => {
    expect(TIME_SLOTS[0]).toBe("00:00");
  });

  it("ends with 23:59", () => {
    expect(TIME_SLOTS[TIME_SLOTS.length - 1]).toBe("23:59");
  });

  it("has 15-minute increments plus 23:59", () => {
    // 24 hours * 4 slots per hour = 96, plus 23:59 = 97
    expect(TIME_SLOTS).toHaveLength(97);
  });

  it("all slots are in HH:MM format", () => {
    TIME_SLOTS.forEach((slot) => {
      expect(slot).toMatch(/^\d{2}:\d{2}$/);
    });
  });
});

describe("UK_UNIVERSITIES", () => {
  it("has at least 30 universities", () => {
    expect(UK_UNIVERSITIES.length).toBeGreaterThanOrEqual(30);
  });

  it("ends with 'Other'", () => {
    expect(UK_UNIVERSITIES[UK_UNIVERSITIES.length - 1]).toBe("Other");
  });

  it("includes major UK universities", () => {
    expect(UK_UNIVERSITIES).toContain("University of Oxford");
    expect(UK_UNIVERSITIES).toContain("University of Cambridge");
    expect(UK_UNIVERSITIES).toContain("UCL");
  });
});
