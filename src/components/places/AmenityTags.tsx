type AmenityTagsProps = {
  has_wifi: boolean;
  has_power_outlets: boolean;
  has_food: boolean;
  has_drinks: boolean;
  is_free_entry: boolean;
};

const AMENITIES = [
  { key: "has_wifi", label: "WiFi", icon: "📶" },
  { key: "has_power_outlets", label: "Power", icon: "🔌" },
  { key: "has_food", label: "Food", icon: "🍕" },
  { key: "has_drinks", label: "Drinks", icon: "☕" },
  { key: "is_free_entry", label: "Free", icon: "✓" },
] as const;

export function AmenityTags(props: AmenityTagsProps) {
  const active = AMENITIES.filter((a) => props[a.key]);

  if (active.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {active.map((amenity) => (
        <span
          key={amenity.key}
          className="inline-flex items-center gap-1 px-2 py-0.5 bg-bg-elevated rounded-full text-[11px] text-text-secondary"
        >
          <span>{amenity.icon}</span>
          {amenity.label}
        </span>
      ))}
    </div>
  );
}
