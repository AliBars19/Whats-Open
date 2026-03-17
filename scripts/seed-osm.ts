/**
 * Seed script: Fetches places from OpenStreetMap Overpass API for UK university cities
 * and inserts them into Supabase.
 *
 * Usage: npx tsx scripts/seed-osm.ts
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const UK_UNI_CITIES = [
  { name: "London", lat: 51.5074, lng: -0.1278 },
  { name: "Manchester", lat: 53.4808, lng: -2.2426 },
  { name: "Birmingham", lat: 52.4862, lng: -1.8904 },
  { name: "Leeds", lat: 53.8008, lng: -1.5491 },
  { name: "Edinburgh", lat: 55.9533, lng: -3.1883 },
  { name: "Glasgow", lat: 55.8642, lng: -4.2518 },
  { name: "Bristol", lat: 51.4545, lng: -2.5879 },
  { name: "Nottingham", lat: 52.9548, lng: -1.1581 },
  { name: "Sheffield", lat: 53.3811, lng: -1.4701 },
  { name: "Liverpool", lat: 53.4084, lng: -2.9916 },
  { name: "Cardiff", lat: 51.4816, lng: -3.1791 },
  { name: "Newcastle", lat: 54.9783, lng: -1.6178 },
  { name: "Southampton", lat: 50.9097, lng: -1.4044 },
  { name: "Oxford", lat: 51.752, lng: -1.2577 },
  { name: "Cambridge", lat: 52.2053, lng: 0.1218 },
  { name: "Bath", lat: 51.3811, lng: -2.359 },
  { name: "Exeter", lat: 50.7184, lng: -3.5339 },
  { name: "York", lat: 53.96, lng: -1.0873 },
  { name: "Aberdeen", lat: 57.1497, lng: -2.0943 },
  { name: "Belfast", lat: 54.5973, lng: -5.9301 },
];

type CategoryMap = {
  [key: string]: string;
};

const AMENITY_TO_CATEGORY: CategoryMap = {
  library: "library",
  cafe: "cafe",
  fast_food: "fast_food",
  restaurant: "restaurant",
  convenience: "convenience_store",
};

const OVERPASS_API = "https://overpass-api.de/api/interpreter";

function buildQuery(lat: number, lng: number): string {
  return `[out:json][timeout:30];
(
  node["amenity"="library"](around:3000,${lat},${lng});
  node["amenity"="cafe"](around:3000,${lat},${lng});
  node["amenity"="fast_food"](around:3000,${lat},${lng});
  node["shop"="convenience"](around:3000,${lat},${lng});
  node["amenity"="restaurant"](around:2000,${lat},${lng});
);
out body;`;
}

function parseOsmHours(hoursStr: string | undefined): Record<string, unknown> {
  if (!hoursStr) return {};

  const hours: Record<string, { open: string; close: string } | null> = {};
  const dayMap: Record<string, string> = {
    Mo: "monday", Tu: "tuesday", We: "wednesday", Th: "thursday",
    Fr: "friday", Sa: "saturday", Su: "sunday",
  };

  if (hoursStr === "24/7") {
    for (const day of Object.values(dayMap)) {
      hours[day] = { open: "00:00", close: "23:59" };
    }
    return hours;
  }

  try {
    const rules = hoursStr.split(";").map((r) => r.trim());
    for (const rule of rules) {
      const match = rule.match(/^([A-Za-z, -]+)\s+(\d{2}:\d{2})-(\d{2}:\d{2})$/);
      if (!match) continue;

      const [, daysPart, open, close] = match;
      const resolvedDays: string[] = [];

      const dayRanges = daysPart.split(",").map((d) => d.trim());
      for (const range of dayRanges) {
        if (range.includes("-")) {
          const [start, end] = range.split("-").map((d) => d.trim());
          const dayKeys = Object.keys(dayMap);
          const startIdx = dayKeys.indexOf(start);
          const endIdx = dayKeys.indexOf(end);
          if (startIdx >= 0 && endIdx >= 0) {
            for (let i = startIdx; i <= endIdx; i++) {
              resolvedDays.push(dayMap[dayKeys[i]]);
            }
          }
        } else if (dayMap[range]) {
          resolvedDays.push(dayMap[range]);
        }
      }

      for (const day of resolvedDays) {
        hours[day] = { open, close };
      }
    }
  } catch {
    return {};
  }

  return hours;
}

function getCategory(tags: Record<string, string>): string {
  if (tags.amenity && AMENITY_TO_CATEGORY[tags.amenity]) {
    return AMENITY_TO_CATEGORY[tags.amenity];
  }
  if (tags.shop === "convenience") return "convenience_store";
  return "other";
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function seedCity(city: { name: string; lat: number; lng: number }): Promise<number> {
  console.log(`Fetching places for ${city.name}...`);

  const query = buildQuery(city.lat, city.lng);

  const response = await fetch(OVERPASS_API, {
    method: "POST",
    body: `data=${encodeURIComponent(query)}`,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  if (!response.ok) {
    console.error(`  Failed for ${city.name}: ${response.status}`);
    return 0;
  }

  const data = await response.json();
  const elements = data.elements || [];
  console.log(`  Found ${elements.length} elements`);

  const places = elements
    .filter((el: { tags?: Record<string, string>; lat?: number; lon?: number }) =>
      el.tags?.name && el.lat && el.lon
    )
    .map((el: { tags: Record<string, string>; lat: number; lon: number }) => ({
      name: el.tags.name,
      description: el.tags.description || null,
      category: getCategory(el.tags),
      address: [el.tags["addr:street"], el.tags["addr:housenumber"]].filter(Boolean).join(" ") || city.name,
      city: city.name,
      postcode: el.tags["addr:postcode"] || null,
      latitude: el.lat,
      longitude: el.lon,
      opening_hours: parseOsmHours(el.tags.opening_hours),
      is_verified: false,
      is_seed_data: true,
      has_wifi: el.tags.internet_access === "wlan" || el.tags.internet_access === "yes",
      has_food: el.tags.amenity === "restaurant" || el.tags.amenity === "fast_food" || el.tags.cuisine !== undefined,
      has_drinks: el.tags.amenity === "cafe" || el.tags.amenity === "restaurant",
      is_free_entry: true,
    }));

  if (places.length === 0) return 0;

  // Insert in batches of 50
  let inserted = 0;
  for (let i = 0; i < places.length; i += 50) {
    const batch = places.slice(i, i + 50);
    const { error } = await supabase.from("places").insert(batch);
    if (error) {
      console.error(`  Insert error for ${city.name}:`, error.message);
    } else {
      inserted += batch.length;
    }
  }

  console.log(`  Inserted ${inserted} places for ${city.name}`);
  return inserted;
}

async function main() {
  console.log("Starting OSM seed...\n");
  let total = 0;

  for (const city of UK_UNI_CITIES) {
    try {
      const count = await seedCity(city);
      total += count;
    } catch (err) {
      console.error(`Error seeding ${city.name}:`, err);
    }
    // Rate limit: 1 request per 2 seconds
    await sleep(2000);
  }

  console.log(`\nDone! Seeded ${total} total places across ${UK_UNI_CITIES.length} cities.`);
}

main().catch(console.error);
