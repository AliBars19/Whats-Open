import { timeAgo } from "@/lib/utils";

describe("timeAgo", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-03-18T12:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns 'just now' for less than a minute ago", () => {
    const date = new Date("2026-03-18T11:59:45Z");
    expect(timeAgo(date)).toBe("just now");
  });

  it("returns minutes for less than an hour ago", () => {
    const date = new Date("2026-03-18T11:45:00Z");
    expect(timeAgo(date)).toBe("15 min ago");
  });

  it("returns '1 min ago' for exactly 1 minute", () => {
    const date = new Date("2026-03-18T11:59:00Z");
    expect(timeAgo(date)).toBe("1 min ago");
  });

  it("returns hours for less than a day ago", () => {
    const date = new Date("2026-03-18T09:00:00Z");
    expect(timeAgo(date)).toBe("3h ago");
  });

  it("returns '1h ago' for exactly 1 hour", () => {
    const date = new Date("2026-03-18T11:00:00Z");
    expect(timeAgo(date)).toBe("1h ago");
  });

  it("returns days for more than 24 hours ago", () => {
    const date = new Date("2026-03-16T12:00:00Z");
    expect(timeAgo(date)).toBe("2d ago");
  });

  it("accepts string dates", () => {
    const date = "2026-03-18T11:30:00Z";
    expect(timeAgo(date)).toBe("30 min ago");
  });

  it("handles ISO string format", () => {
    const date = "2026-03-17T12:00:00.000Z";
    expect(timeAgo(date)).toBe("1d ago");
  });
});
