import { isWithinRadius, formatDistance } from "@/lib/geo";

describe("isWithinRadius", () => {
  // Known coordinates: Big Ben to London Eye ≈ 560m
  const bigBenLat = 51.5007;
  const bigBenLng = -0.1246;
  const londonEyeLat = 51.5033;
  const londonEyeLng = -0.1195;

  // Very close points: ~50m apart
  const pointALat = 51.5074;
  const pointALng = -0.1278;
  const pointBLat = 51.5078;
  const pointBLng = -0.1275;

  it("returns true when points are within default 200m radius", () => {
    // Points ~50m apart should be within 200m
    expect(isWithinRadius(pointALat, pointALng, pointBLat, pointBLng)).toBe(true);
  });

  it("returns false when points are outside default 200m radius", () => {
    // Big Ben to London Eye ~560m, outside 200m
    expect(isWithinRadius(bigBenLat, bigBenLng, londonEyeLat, londonEyeLng)).toBe(false);
  });

  it("returns true when points are within a custom larger radius", () => {
    // Big Ben to London Eye ~560m, within 1000m
    expect(isWithinRadius(bigBenLat, bigBenLng, londonEyeLat, londonEyeLng, 1000)).toBe(true);
  });

  it("returns true when same point", () => {
    expect(isWithinRadius(51.5074, -0.1278, 51.5074, -0.1278)).toBe(true);
  });

  it("returns true at exact boundary", () => {
    // Distance of 0 should always be within any positive radius
    expect(isWithinRadius(0, 0, 0, 0, 1)).toBe(true);
  });

  it("handles coordinates across different hemispheres", () => {
    // London to Sydney: ~17,000km — way outside 200m
    expect(isWithinRadius(51.5074, -0.1278, -33.8688, 151.2093)).toBe(false);
  });

  it("handles negative coordinates", () => {
    // Two close points in the southern hemisphere
    expect(isWithinRadius(-33.8688, 151.2093, -33.8690, 151.2095, 200)).toBe(true);
  });
});

describe("formatDistance", () => {
  it("formats distances under 1km in metres", () => {
    expect(formatDistance(50)).toBe("50m away");
    expect(formatDistance(350)).toBe("350m away");
    expect(formatDistance(999)).toBe("999m away");
  });

  it("rounds metres to nearest integer", () => {
    expect(formatDistance(350.7)).toBe("351m away");
    expect(formatDistance(49.2)).toBe("49m away");
  });

  it("formats distances at and above 1km in kilometres", () => {
    expect(formatDistance(1000)).toBe("1.0km away");
    expect(formatDistance(1500)).toBe("1.5km away");
    expect(formatDistance(2300)).toBe("2.3km away");
  });

  it("handles zero distance", () => {
    expect(formatDistance(0)).toBe("0m away");
  });

  it("handles very large distances", () => {
    expect(formatDistance(100000)).toBe("100.0km away");
  });
});
