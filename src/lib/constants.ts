export const CATEGORIES = [
  { value: "library", label: "Library", icon: "book" },
  { value: "study_space", label: "Study Space", icon: "book-open" },
  { value: "cafe", label: "Cafe", icon: "coffee" },
  { value: "restaurant", label: "Restaurant", icon: "utensils" },
  { value: "fast_food", label: "Fast Food", icon: "burger" },
  { value: "convenience_store", label: "Convenience", icon: "shopping-bag" },
  { value: "24_hour", label: "24 Hour", icon: "moon" },
  { value: "other", label: "Other", icon: "map-pin" },
] as const;

export type PlaceCategory = (typeof CATEGORIES)[number]["value"];

export const FILTER_CHIPS = [
  { value: null, label: "All" },
  { value: "library", label: "Study" },
  { value: "cafe", label: "Cafe" },
  { value: "restaurant", label: "Food" },
  { value: "fast_food", label: "Fast Food" },
  { value: "24_hour", label: "24hr" },
  { value: "other", label: "Other" },
] as const;

export const CHECKIN_RADIUS_METRES = 200;

export const STATUS_COLORS = {
  open: "#22c55e",
  closed: "#ef4444",
  reported_closed: "#f59e0b",
  reported_open: "#f59e0b",
  unknown: "#6b7280",
} as const;

export const UK_UNIVERSITIES = [
  "University of Oxford",
  "University of Cambridge",
  "Imperial College London",
  "UCL",
  "University of Edinburgh",
  "University of Manchester",
  "King's College London",
  "London School of Economics",
  "University of Bristol",
  "University of Warwick",
  "University of Glasgow",
  "University of Birmingham",
  "University of Sheffield",
  "University of Leeds",
  "University of Nottingham",
  "University of Southampton",
  "University of Liverpool",
  "University of Exeter",
  "Newcastle University",
  "Cardiff University",
  "University of Bath",
  "University of York",
  "University of Aberdeen",
  "Queen's University Belfast",
  "University of St Andrews",
  "Durham University",
  "Lancaster University",
  "Loughborough University",
  "University of Sussex",
  "University of Leicester",
  "University of East Anglia",
  "University of Surrey",
  "University of Strathclyde",
  "Royal Holloway",
  "Queen Mary University of London",
  "Heriot-Watt University",
  "Brunel University London",
  "SOAS University of London",
  "Swansea University",
  "Other",
] as const;

export const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export const TIME_SLOTS: string[] = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 15) {
    TIME_SLOTS.push(
      `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
    );
  }
}
TIME_SLOTS.push("23:59");
