import { describe, expect, it } from 'vitest'
import { availableTiles, gameStatus, legalPairs, SOLUTION } from './engine'
import type { Pair, Tile } from './engine'
import { createGameStore } from './store'
import type { GameStore } from './store'

function match(store: ReturnType<typeof createGameStore>, pair: Pair) {
  store.getState().selectTile(pair[0])
  store.getState().selectTile(pair[1])
}

function expectInvariant(state: GameStore) {
  expect([...state.removedIds].sort()).toEqual(state.history.flat().sort())
  expect(new Set(state.removedIds).size).toBe(state.removedIds.length)
  expect(state.removedIds.length % 2).toBe(0)
}

describe('selection', () => {
  it('selects, deselects, and moves selection for a mismatch', () => {
    const store = createGameStore(() => 0.5)
    const first = availableTiles(store.getState())[0]
    const other = availableTiles(store.getState()).find((tile) => tile.face !== first.face)!
    store.getState().selectTile(first.id)
    expect(store.getState().selectedId).toBe(first.id)
    store.getState().selectTile(first.id)
    expect(store.getState().selectedId).toBeNull()
    store.getState().selectTile(first.id)
    store.getState().selectTile(other.id)
    expect(store.getState().selectedId).toBe(other.id)
    expect(store.getState().history).toEqual([])
  })

  it('ignores blocked, removed, and unknown IDs without clearing a hint', () => {
    const store = createGameStore(() => 0.5)
    match(store, SOLUTION[0])
    store.getState().hint()
    const before = store.getState()
    const blocked = before.startingDeal.find((tile) => !before.removedIds.includes(tile.id)
      && !availableTiles(before).some((available) => available.id === tile.id))!
    for (const id of [blocked.id, SOLUTION[0][0], 'unknown']) {
      store.getState().selectTile(id)
      expect(store.getState()).toBe(before)
    }
  })

  it('removes both tiles in one update and ignores rapid stale clicks', () => {
    const store = createGameStore(() => 0.5)
    const [a, b] = SOLUTION[0]
    store.getState().selectTile(a)
    const changes: GameStore[] = []
    const unsubscribe = store.subscribe((state) => changes.push(state))
    store.getState().selectTile(b)
    store.getState().selectTile(b)
    store.getState().selectTile(a)
    expect(changes).toHaveLength(1)
    expect(changes[0].removedIds).toEqual([a, b])
    expect(changes[0].history).toEqual([[a, b]])
    expect(changes[0].selectedId).toBeNull()
    expectInvariant(changes[0])
    unsubscribe()
  })
})

describe('hints and recovery', () => {
  it('highlights the first legal pair and clears selection', () => {
    const store = createGameStore(() => 0.5)
    store.getState().selectTile(availableTiles(store.getState())[0].id)
    const first = legalPairs(store.getState())[0]
    store.getState().hint()
    expect(store.getState().hintPair).toEqual(first)
    expect(store.getState().selectedId).toBeNull()
    store.getState().hint()
    expect(store.getState().hintPair).toEqual(first)
    store.getState().selectTile(first[0])
    expect(store.getState().hintPair).toBeNull()
  })

  it('restores exact pairs in reverse order and permits unlimited undo', () => {
    const store = createGameStore(() => 0.5)
    const original = store.getState().startingDeal
    const snapshots: readonly string[][] = SOLUTION.map((pair) => {
      const removed = [...store.getState().removedIds]
      match(store, pair)
      expectInvariant(store.getState())
      return removed
    })
    expect(gameStatus(store.getState())).toBe('won')
    for (const expected of [...snapshots].reverse()) {
      store.getState().undo()
      expect(store.getState().removedIds).toEqual(expected)
      expect(store.getState().startingDeal).toBe(original)
      expect(store.getState().selectedId).toBeNull()
      expect(store.getState().hintPair).toBeNull()
      expectInvariant(store.getState())
    }
    const empty = store.getState()
    store.getState().undo()
    expect(store.getState()).toBe(empty)
  })

  it('clears selection and hints on undo', () => {
    const store = createGameStore(() => 0.5)
    match(store, SOLUTION[0])
    store.getState().hint()
    store.getState().undo()
    expect(store.getState().hintPair).toBeNull()
    match(store, SOLUTION[0])
    store.getState().selectTile(SOLUTION[1][0])
    store.getState().undo()
    expect(store.getState().selectedId).toBeNull()
  })

  it('recovers from a dead end with undo', () => {
    const deal: Tile[] = [
      { id: 'a', x: 0, y: 0, z: 0, face: 0 },
      { id: 'b', x: 1, y: 0, z: 0, face: 1 },
      { id: 'c', x: 2, y: 0, z: 0, face: 0 },
      { id: 'd', x: 3, y: 0, z: 0, face: 1 },
      { id: 'e', x: 0, y: 2, z: 0, face: 2 },
      { id: 'f', x: 1, y: 2, z: 0, face: 2 },
    ]
    const store = createGameStore(() => 0, deal)
    match(store, ['e', 'f'])
    expect(gameStatus(store.getState())).toBe('dead-end')
    const beforeHint = store.getState()
    store.getState().hint()
    expect(store.getState()).toBe(beforeHint)
    store.getState().undo()
    expect(gameStatus(store.getState())).toBe('playing')
  })
})

describe('resets and isolation', () => {
  it('restarts the exact deal and preserves all action references', () => {
    const store = createGameStore(() => 0.5)
    const original = store.getState()
    match(store, SOLUTION[0])
    store.getState().hint()
    store.getState().restart()
    expect(store.getState()).toEqual(original)
    expect(store.getState().startingDeal).toBe(original.startingDeal)
    match(store, SOLUTION[0])
    expect(store.getState().removedIds).toHaveLength(2)
  })

  it('starts a different deal with cleared state and working actions', () => {
    const store = createGameStore(() => 0.5)
    const original = store.getState()
    match(store, SOLUTION[0])
    store.getState().hint()
    store.getState().newGame()
    const next = store.getState()
    expect(next.startingDeal).not.toEqual(original.startingDeal)
    expect(next.removedIds).toEqual([])
    expect(next.history).toEqual([])
    expect(next.selectedId).toBeNull()
    expect(next.hintPair).toBeNull()
    for (const action of ['selectTile', 'undo', 'hint', 'restart', 'newGame'] as const) {
      expect(next[action]).toBe(original[action])
    }
    match(store, SOLUTION[0])
    expect(store.getState().removedIds).toHaveLength(2)
  })

  it('keeps store instances and previous snapshots independent', () => {
    const first = createGameStore(() => 0.5)
    const second = createGameStore(() => 0.5)
    const firstOriginal = first.getState()
    const secondOriginal = second.getState()
    match(first, SOLUTION[0])
    expect(second.getState()).toBe(secondOriginal)
    expect(firstOriginal.removedIds).toEqual([])
    expect(firstOriginal.history).toEqual([])
    expect(first.getState().history).toHaveLength(1)
  })
})
