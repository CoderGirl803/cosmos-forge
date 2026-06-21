import { beforeEach, describe, expect, it, vi } from "vitest";
import { useGameStore, fmtYear } from "./useGameStore";

describe("fmtYear", () => {
  it("formats game years into readable units", () => {
    expect(fmtYear(42)).toBe("42");
    expect(fmtYear(12_000)).toBe("12.0k");
    expect(fmtYear(4_500_000)).toBe("4.5M");
    expect(fmtYear(5_000_000_000)).toBe("5.0B");
  });
});

describe("useGameStore", () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
    vi.restoreAllMocks();
  });

  it("starts with the intro state and baseline resources", () => {
    const state = useGameStore.getState();

    expect(state.phase).toBe("intro");
    expect(state.population).toBe(0);
    expect(state.food).toBe(10);
    expect(state.energy).toBe(10);
    expect(state.health).toBe(100);
    expect(state.suggestions.find((s) => s.id === "spark_life")?.unlocked).toBe(true);
  });

  it("applies and marks a suggestion as completed", () => {
    useGameStore.getState().completeSuggestion("spark_life");

    const state = useGameStore.getState();
    expect(state.population).toBe(500_000);
    expect(state.health).toBe(95);
    expect(state.suggestions.find((s) => s.id === "spark_life")?.completed).toBe(true);
    expect(state.logs[0].text).toContain("spark life achieved");
  });

  it("only advances time while civilization is active", () => {
    useGameStore.getState().advanceTime(1_000_000_000);
    expect(useGameStore.getState().year).toBe(0);

    useGameStore.setState({ phase: "civilization" });
    useGameStore.getState().advanceTime(1_000_000_000);

    expect(useGameStore.getState().year).toBe(1_000_000_000);
    expect(useGameStore.getState().suggestions.find((s) => s.id === "multicellular")?.unlocked).toBe(true);
  });

  it("tracks sent signals and stores the response until dismissed", () => {
    const signalId = useGameStore.getState().sendSignal("kepler-452b");
    vi.spyOn(Math, "random").mockReturnValue(0);

    useGameStore.getState().deliverSignalResponse(signalId);

    const state = useGameStore.getState();
    expect(state.signals[0]).toMatchObject({ to: "kepler-452b", responded: true });
    expect(state.pendingSignalResponse).toMatchObject({
      from: "kepler-452b",
      signalId,
    });
  });
});
