import type { OpeningHours } from "@/lib/hours";
import type { PlaceCategory } from "@/lib/constants";

export type Place = {
  id: string;
  name: string;
  description: string | null;
  category: PlaceCategory;
  address: string;
  city: string;
  postcode: string | null;
  latitude: number;
  longitude: number;
  opening_hours: OpeningHours;
  is_verified: boolean;
  verification_count: number;
  last_verified_at: string | null;
  submitted_by: string | null;
  is_seed_data: boolean;
  avg_noise_level: number;
  avg_rating: number;
  total_reviews: number;
  has_wifi: boolean;
  has_power_outlets: boolean;
  has_food: boolean;
  has_drinks: boolean;
  is_free_entry: boolean;
  photo_url: string | null;
  website_url: string | null;
  created_at: string;
  updated_at: string;
};

export type PlaceWithDistance = Place & {
  distance_metres: number;
  recent_checkins_open: number;
  recent_checkins_closed: number;
};

export type LiveCheckin = {
  id: string;
  place_id: string;
  user_id: string;
  is_open: boolean;
  note: string | null;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url: string | null;
  };
};

export type Review = {
  id: string;
  place_id: string;
  user_id: string;
  rating: number;
  noise_level: number | null;
  comment: string | null;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url: string | null;
  };
};

export type Profile = {
  id: string;
  username: string;
  university: string | null;
  avatar_url: string | null;
  is_premium: boolean;
  premium_expires_at: string | null;
  stripe_customer_id: string | null;
  reputation_score: number;
  total_checkins: number;
  total_places_added: number;
  created_at: string;
  updated_at: string;
};
