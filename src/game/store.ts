import { createStore } from 'zustand/vanilla'
import { createDeal, hint, initialState, nextDeal, selectTile, undo } from './engine'
import type { GameState, RandomSource, Tile } from './engine'

export type GameActions = {
  selectTile: (id: string) => void
  hint: () => void
  undo: () => void
  restart: () => void
  newGame: () => void
}

export type GameStore = GameState & GameActions

export function createGameStore(random: RandomSource = Math.random, deal?: readonly Tile[]) {
  return createStore<GameStore>()((set) => ({
    ...initialState(deal ?? createDeal(random).tiles),
    selectTile: (id) => set((state) => selectTile(state, id)),
    hint: () => set(hint),
    undo: () => set(undo),
    restart: () => set((state) => initialState(state.startingDeal)),
    newGame: () => set((state) => initialState(nextDeal(state.startingDeal, random))),
  }))
}
