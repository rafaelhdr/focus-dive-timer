import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { formatRemainingTime } from "./useTimer";

describe("formatRemainingTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("formats clock", () => {
    expect(
      formatRemainingTime({
        isRunning: true,
        endsAt: 5 * 60_000,
        remainingTime: null,
        format: "clock",
      }),
    ).toBe("05:00");
    expect(
      formatRemainingTime({
        isRunning: true,
        endsAt: 25 * 60_000,
        remainingTime: null,
        format: "clock",
      }),
    ).toBe("25:00");
  });

  it("formats badge minutes", () => {
    expect(
      formatRemainingTime({
        isRunning: true,
        endsAt: 5 * 60_000,
        remainingTime: null,
        format: "badge",
      }),
    ).toBe("5");
    expect(
      formatRemainingTime({
        isRunning: true,
        endsAt: 25 * 60_000,
        remainingTime: null,
        format: "badge",
      }),
    ).toBe("25");
  });

  it("formats badge seconds", () => {
    expect(
      formatRemainingTime({
        isRunning: true,
        endsAt: 10 * 1000,
        remainingTime: null,
        format: "badge",
      }),
    ).toBe("10");
  });

  it("badge rounds down", () => {
    expect(
      formatRemainingTime({
        isRunning: true,
        endsAt: 10 * 60_000 + 1000,
        remainingTime: null,
        format: "badge",
      }),
    ).toBe("10");
    expect(
      formatRemainingTime({
        isRunning: true,
        endsAt: 10 * 60_000 - 1000,
        remainingTime: null,
        format: "badge",
      }),
    ).toBe("9");
  });
});
