import { describe, expect, it } from "vitest";
import { DEFAULT_HYDRATION_GOAL_ML, hydrationProgress, waterMl } from "./hydration";

describe("Daily water tracking", () => {
  it("converts glasses to milliliters", () => { expect(waterMl(2, "glasses")).toBe(500); });
  it("converts liters to milliliters", () => { expect(waterMl(0.75, "liters")).toBe(750); });
  it("starts with an editable two-liter goal", () => { expect(DEFAULT_HYDRATION_GOAL_ML).toBe(2000); });
  it("shows progress against the selected goal", () => { expect(hydrationProgress(750, 3000)).toEqual({ percent: 25, remaining: 2250 }); });
  it("caps progress without discarding extra intake", () => { expect(hydrationProgress(2500, 2000)).toEqual({ percent: 100, remaining: 0 }); });
  it("rejects invalid amounts", () => { for (const q of [0, -1, NaN, Infinity, 0.00001]) expect(() => waterMl(q, "liters")).toThrow(); });
});