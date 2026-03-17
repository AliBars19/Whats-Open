"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useDebounce } from "@/hooks/useDebounce";
import { useToast } from "@/components/ui/Toast";
import { CATEGORIES } from "@/lib/constants";
import { MAPBOX_TOKEN } from "@/lib/mapbox";
import { HoursPicker } from "./HoursPicker";
import type { OpeningHours } from "@/lib/hours";
import type { PlaceCategory } from "@/lib/constants";

type Step = 1 | 2 | 3 | 4 | 5;

type GeoResult = {
  place_name: string;
  center: [number, number];
  context?: Array<{ id: string; text: string }>;
  text: string;
};

export function AddPlaceForm() {
  const [step, setStep] = useState<Step>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeoResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string; city: string; postcode: string } | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<PlaceCategory>("cafe");
  const [description, setDescription] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [hours, setHours] = useState<OpeningHours>({});
  const [skipHours, setSkipHours] = useState(false);
  const [amenities, setAmenities] = useState({
    has_wifi: false,
    has_power_outlets: false,
    has_food: false,
    has_drinks: false,
    is_free_entry: true,
  });

  const debouncedQuery = useDebounce(searchQuery, 300);
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  // Geocoding search
  const handleSearch = async (query: string) => {
    if (!query.trim() || !MAPBOX_TOKEN) return;
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?country=gb&types=address,poi&limit=5&access_token=${MAPBOX_TOKEN}`
      );
      const data = await res.json();
      setSearchResults(data.features || []);
    } catch {
      setSearchResults([]);
    }
  };

  // Trigger search on debounced value
  useState(() => {
    if (debouncedQuery) handleSearch(debouncedQuery);
  });

  const selectLocation = (result: GeoResult) => {
    const city = result.context?.find((c) => c.id.startsWith("place"))?.text || "";
    const postcode = result.context?.find((c) => c.id.startsWith("postcode"))?.text || "";
    setLocation({
      lat: result.center[1],
      lng: result.center[0],
      address: result.place_name,
      city,
      postcode,
    });
    setSearchResults([]);
    if (!name) setName(result.text);
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!user || !location) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("places")
      .insert({
        name,
        description: description || null,
        category,
        address: location.address,
        city: location.city,
        postcode: location.postcode || null,
        latitude: location.lat,
        longitude: location.lng,
        opening_hours: skipHours ? {} : hours,
        submitted_by: user.id,
        website_url: websiteUrl || null,
        ...amenities,
      })
      .select("id")
      .single();

    if (error) {
      showToast("Failed to add place", "error");
    } else if (data) {
      showToast("Place added! It'll show as Unverified until 3 students confirm it.", "success");
      router.push(`/place/${data.id}`);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress */}
      <div className="flex gap-1 mb-6">
        {[1, 2, 3, 4, 5].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? "bg-accent-primary" : "bg-bg-elevated"}`}
          />
        ))}
      </div>

      {/* Step 1: Location */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-text-primary">Find the location</h2>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value.trim()) handleSearch(e.target.value);
            }}
            placeholder="Search for an address..."
            className="w-full h-12 px-4 rounded-xl bg-bg-input border border-border-subtle
              text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary/50"
          />
          {searchResults.length > 0 && (
            <div className="space-y-1">
              {searchResults.map((result, i) => (
                <button
                  key={i}
                  onClick={() => selectLocation(result)}
                  className="w-full text-left p-3 rounded-xl bg-bg-card hover:bg-bg-elevated transition-colors"
                >
                  <p className="text-sm text-text-primary">{result.text}</p>
                  <p className="text-xs text-text-muted truncate">{result.place_name}</p>
                </button>
              ))}
            </div>
          )}
          {location && (
            <div className="p-3 bg-accent-green/10 rounded-xl">
              <p className="text-sm text-accent-green font-medium">Selected:</p>
              <p className="text-xs text-text-secondary">{location.address}</p>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-text-primary">Basic details</h2>
          <div>
            <label className="text-sm text-text-secondary block mb-1">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Place name"
              required
              className="w-full h-12 px-4 rounded-xl bg-bg-input border border-border-subtle
                text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary/50"
            />
          </div>
          <div>
            <label className="text-sm text-text-secondary block mb-1">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as PlaceCategory)}
              className="w-full h-12 px-4 rounded-xl bg-bg-input border border-border-subtle text-text-primary"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-text-secondary block mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What makes this place good?"
              maxLength={200}
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-bg-input border border-border-subtle
                text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-accent-primary/50"
            />
          </div>
          <div>
            <label className="text-sm text-text-secondary block mb-1">Website</label>
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://..."
              className="w-full h-12 px-4 rounded-xl bg-bg-input border border-border-subtle
                text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary/50"
            />
          </div>
        </div>
      )}

      {/* Step 3: Hours */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-text-primary">Opening hours</h2>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={skipHours}
              onChange={(e) => setSkipHours(e.target.checked)}
              className="rounded border-border-subtle"
            />
            <span className="text-sm text-text-secondary">I&apos;m not sure about hours</span>
          </label>
          {!skipHours && <HoursPicker value={hours} onChange={setHours} />}
        </div>
      )}

      {/* Step 4: Amenities */}
      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-text-primary">Amenities</h2>
          {[
            { key: "has_wifi", label: "WiFi available" },
            { key: "has_power_outlets", label: "Power outlets" },
            { key: "has_food", label: "Food available" },
            { key: "has_drinks", label: "Drinks available" },
            { key: "is_free_entry", label: "Free entry" },
          ].map((item) => (
            <label key={item.key} className="flex items-center justify-between p-3 bg-bg-elevated rounded-xl cursor-pointer">
              <span className="text-sm text-text-primary">{item.label}</span>
              <input
                type="checkbox"
                checked={amenities[item.key as keyof typeof amenities]}
                onChange={(e) => setAmenities({ ...amenities, [item.key]: e.target.checked })}
                className="w-5 h-5 rounded border-border-subtle text-accent-primary"
              />
            </label>
          ))}
        </div>
      )}

      {/* Step 5: Confirm */}
      {step === 5 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-text-primary">Confirm &amp; submit</h2>
          <div className="bg-bg-card border border-border-subtle rounded-xl p-4 space-y-2">
            <p className="text-sm"><span className="text-text-muted">Name:</span> {name}</p>
            <p className="text-sm"><span className="text-text-muted">Category:</span> {CATEGORIES.find((c) => c.value === category)?.label}</p>
            <p className="text-sm"><span className="text-text-muted">Address:</span> {location?.address}</p>
            {description && <p className="text-sm"><span className="text-text-muted">Description:</span> {description}</p>}
            <p className="text-sm"><span className="text-text-muted">Hours:</span> {skipHours ? "Not provided" : "Provided"}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        {step > 1 && (
          <button
            onClick={() => setStep((step - 1) as Step)}
            className="flex-1 py-3 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary border border-border-subtle"
          >
            Back
          </button>
        )}
        {step < 5 ? (
          <button
            onClick={() => setStep((step + 1) as Step)}
            disabled={step === 1 && !location || step === 2 && !name}
            className="flex-1 py-3 bg-accent-primary text-bg-primary rounded-xl text-sm font-semibold
              hover:opacity-90 transition-opacity disabled:opacity-50 min-h-[44px]"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-3 bg-accent-primary text-bg-primary rounded-xl text-sm font-semibold
              hover:opacity-90 transition-opacity disabled:opacity-50 min-h-[44px]"
          >
            {loading ? "Submitting..." : "Submit Place"}
          </button>
        )}
      </div>
    </div>
  );
}
