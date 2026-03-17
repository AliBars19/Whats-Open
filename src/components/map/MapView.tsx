"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAPBOX_TOKEN, MAP_STYLE, DEFAULT_ZOOM } from "@/lib/mapbox";
import { STATUS_COLORS } from "@/lib/constants";
import { getStatusWithCheckins } from "@/lib/hours";
import type { PlaceWithDistance } from "@/types";

type MapViewProps = {
  places: PlaceWithDistance[];
  userLat: number | null;
  userLng: number | null;
  onPlaceSelect: (place: PlaceWithDistance | null) => void;
};

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    library: "📚",
    study_space: "📖",
    cafe: "☕",
    restaurant: "🍴",
    fast_food: "🍔",
    convenience_store: "🛒",
    "24_hour": "🌙",
    other: "📍",
  };
  return icons[category] || "📍";
}

export function MapView({ places, userLat, userLng, onPlaceSelect }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAP_STYLE,
      center: [userLng || -1.2577, userLat || 51.752],
      zoom: DEFAULT_ZOOM,
      attributionControl: false,
    });

    map.current.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-left");

    map.current.on("load", () => setLoaded(true));

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update user location marker
  useEffect(() => {
    if (!map.current || !loaded || userLat === null || userLng === null) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLngLat([userLng, userLat]);
    } else {
      const el = document.createElement("div");
      el.innerHTML = `
        <div style="position:relative;width:20px;height:20px;">
          <div style="position:absolute;inset:0;background:#3b82f6;border-radius:50%;border:3px solid white;z-index:2;"></div>
          <div class="animate-pulse-ring" style="position:absolute;inset:-4px;background:#3b82f680;border-radius:50%;z-index:1;"></div>
        </div>
      `;
      userMarkerRef.current = new mapboxgl.Marker({ element: el })
        .setLngLat([userLng, userLat])
        .addTo(map.current);
    }

    map.current.flyTo({ center: [userLng, userLat], zoom: DEFAULT_ZOOM, duration: 1000 });
  }, [userLat, userLng, loaded]);

  // Update place markers
  useEffect(() => {
    if (!map.current || !loaded) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    places.forEach((place) => {
      const status = getStatusWithCheckins(
        place.opening_hours,
        place.recent_checkins_open,
        place.recent_checkins_closed
      );
      const color = STATUS_COLORS[status.displayStatus];
      const icon = getCategoryIcon(place.category);

      const el = document.createElement("div");
      el.style.cursor = "pointer";
      el.innerHTML = `
        <div style="width:36px;height:36px;border-radius:50%;background:${color}20;border:2px solid ${color};
          display:flex;align-items:center;justify-content:center;font-size:16px;">
          ${icon}
        </div>
      `;

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onPlaceSelect(place);
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([place.longitude, place.latitude])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [places, loaded, onPlaceSelect]);

  const recenter = useCallback(() => {
    if (map.current && userLat !== null && userLng !== null) {
      map.current.flyTo({ center: [userLng, userLat], zoom: DEFAULT_ZOOM, duration: 500 });
    }
  }, [userLat, userLng]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Locate me button */}
      <button
        onClick={recenter}
        className="absolute bottom-4 right-4 w-11 h-11 bg-bg-elevated border border-border-subtle rounded-full
          flex items-center justify-center shadow-lg hover:bg-bg-card transition-colors z-10"
        aria-label="Center on my location"
      >
        <svg className="w-5 h-5 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </div>
  );
}
