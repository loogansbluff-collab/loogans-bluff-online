import { create } from "zustand";

type GameMode = "aerial" | "street";

type GameState = {
  mode: GameMode;
  setMode: (mode: GameMode) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
};

export const useGameStore = create<GameState>((set) => ({
  mode: "aerial",
  setMode: (mode) =>
    set((state) => ({
      mode,
      selectedId: mode === "street" ? null : state.selectedId,
    })),
  selectedId: null,
  setSelectedId: (id) => set({ selectedId: id }),
}));
