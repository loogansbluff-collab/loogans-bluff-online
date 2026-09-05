import { create } from "zustand";

type GameMode = "aerial" | "street";

type GameState = {
  mode: GameMode;
  setMode: (mode: GameMode) => void;
};

export const useGameStore = create<GameState>((set) => ({
  mode: "aerial",
  setMode: (mode) => set({ mode }),
}));
