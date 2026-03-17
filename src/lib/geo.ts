const EARTH_RADIUS_METRES = 6371000;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function getDistanceBetween(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METRES * c;
}

export function isWithinRadius(
  userLat: number,
  userLng: number,
  placeLat: number,
  placeLng: number,
  maxMetres: number = 200
): boolean {
  return getDistanceBetween(userLat, userLng, placeLat, placeLng) <= maxMetres;
}

export function formatDistance(metres: number): string {
  if (metres < 1000) {
    return `${Math.round(metres)}m away`;
  }
  return `${(metres / 1000).toFixed(1)}km away`;
}
