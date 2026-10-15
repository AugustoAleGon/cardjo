import { useStore } from 'zustand'
import { createGameStore } from './store'
import type { GameStore } from './store'

export const gameStore = createGameStore()

export function useGame<T>(selector: (state: GameStore) => T): T {
  return useStore(gameStore, selector)
}
