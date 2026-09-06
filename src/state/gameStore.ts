import { create } from "zustand";

type GameMode = "aerial" | "street";
type PlayerPosition = [number, number, number];
type FocusPosition = [number, number, number];

type GameState = {
  mode: GameMode;
  setMode: (mode: GameMode) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  playerPosition: PlayerPosition;
  setPlayerPosition: (position: PlayerPosition) => void;
  focusNonce: number;
  focusPosition: FocusPosition | null;
  requestFocus: (position: FocusPosition) => void;
  resetNonce: number;
  requestAerialReset: () => void;
};

export const useGameStore = create<GameState>((set) => ({
  mode: "aerial",
  setMode: (mode) => set({ mode }),
  selectedId: null,
  setSelectedId: (id) => set({ selectedId: id }),
  playerPosition: [0, 0, 0],
  setPlayerPosition: (position) => set({ playerPosition: position }),
  focusNonce: 0,
  focusPosition: null,
  requestFocus: (position) =>
    set((state) => ({
      focusPosition: position,
      focusNonce: state.focusNonce + 1,
    })),
  resetNonce: 0,
  requestAerialReset: () =>
    set((state) => ({
      focusPosition: null,
      resetNonce: state.resetNonce + 1,
    })),
}));
