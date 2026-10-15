import { describe, expect, it } from 'vitest'
import { availableTiles, createDeal, gameStatus, initialState, isAvailable, LAYOUT, legalPairs, nextDeal, selectTile } from './engine'
import type { Tile } from './engine'

function randomFromSeed(seed: number) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    return seed / 4294967296
  }
}

const tile = (id: string, x: number, y: number, z = 0, face = 0): Tile => ({ id, x, y, z, face })

describe('starting deals', () => {
  it('contains 36 unique positions and four copies of each face', () => {
    const deal = createDeal(() => 0.5).tiles
    expect(deal).toHaveLength(36)
    expect(new Set(deal.map((tile) => tile.id)).size).toBe(36)
    for (let face = 0; face < 9; face++) expect(deal.filter((tile) => tile.face === face)).toHaveLength(4)
    expect(LAYOUT.filter((tile) => tile.z === 0)).toHaveLength(24)
  })

  it.each([0, 0.1, 0.5, 0.999999])('clears the known solution with random input %s', (value) => {
    const deal = createDeal(() => value)
    let state = initialState(deal.tiles)
    for (const [first, second] of deal.solution) {
      state = selectTile(selectTile(state, first), second)
    }
    expect(state.removedIds).toHaveLength(36)
    expect(state.history).toHaveLength(18)
    expect(gameStatus(state)).toBe('won')
  })

  it('blocks covered tiles and tiles with two occupied sides', () => {
    const deal = createDeal(() => 0).tiles
    expect(isAvailable(deal.find((tile) => tile.id === '0:0:1')!, deal)).toBe(false)
    expect(isAvailable(deal.find((tile) => tile.id === '1:0.5:2')!, deal)).toBe(false)
    expect(isAvailable(deal.find((tile) => tile.id === '1:0.5:1')!, deal)).toBe(true)
  })

  it('replays the solution across 100 seeded deals', () => {
    for (let seed = 0; seed < 100; seed++) {
      const deal = createDeal(randomFromSeed(seed))
      let state = initialState(deal.tiles)
      for (const [first, second] of deal.solution) {
        const available = availableTiles(state).map((candidate) => candidate.id)
        expect(available).toContain(first)
        expect(available).toContain(second)
        state = selectTile(selectTile(state, first), second)
      }
      expect(gameStatus(state)).toBe('won')
    }
  })

  it('creates a different solvable deal even when the random source repeats', () => {
    const generated = createDeal(() => 0.5)
    const first = generated.tiles
    const second = nextDeal(first, () => 0.5)
    expect(second).not.toEqual(first)
    let state = initialState(second)
    for (const [a, b] of generated.solution) state = selectTile(selectTile(state, a), b)
    expect(gameStatus(state)).toBe('won')
  })
})

describe('availability geometry', () => {
  const center = tile('center', 1, 1)

  it('allows either open horizontal side', () => {
    const left = tile('left', 0, 1)
    const right = tile('right', 2, 1)
    expect(isAvailable(center, [center, left, right])).toBe(false)
    expect(isAvailable(center, [center, left])).toBe(true)
    expect(isAvailable(center, [center, right])).toBe(true)
    expect(isAvailable(center, [center])).toBe(true)
  })

  it('counts partial overlap from any higher layer', () => {
    expect(isAvailable(center, [center, tile('high', 1.5, 1.5, 3)])).toBe(false)
    expect(isAvailable(center, [center, tile('low', 1, 1, -1)])).toBe(true)
  })

  it('does not count edge or corner contact as coverage', () => {
    expect(isAvailable(center, [center, tile('edge-x', 2, 1, 1)])).toBe(true)
    expect(isAvailable(center, [center, tile('edge-y', 1, 2, 1)])).toBe(true)
    expect(isAvailable(center, [center, tile('corner', 2, 2, 1)])).toBe(true)
  })

  it('requires side blockers on the same layer with positive vertical overlap', () => {
    const right = tile('right', 2, 1)
    expect(isAvailable(center, [center, right, tile('partial-left', 0, 1.5)])).toBe(false)
    expect(isAvailable(center, [center, right, tile('touch-left', 0, 2)])).toBe(true)
    expect(isAvailable(center, [center, right, tile('upper-left', 0, 1, 1)])).toBe(true)
  })

  it('rejects a tile that is no longer on the board', () => {
    expect(isAvailable(center, [tile('other', 0, 0)])).toBe(false)
  })

  it('exposes a base tile only after both overlapping upper tiles disappear', () => {
    const base = tile('base', 1, 1)
    const above = tile('above', 1, 0.5, 1)
    const below = tile('below', 1, 1.5, 1)
    expect(isAvailable(base, [base, above, below])).toBe(false)
    expect(isAvailable(base, [base, below])).toBe(false)
    expect(isAvailable(base, [base])).toBe(true)
  })
})

describe('matching and status', () => {
  it('does not match an available tile with a blocked tile of the same face', () => {
    const state = initialState([tile('a', 0, 0), tile('b', 1, 0), tile('c', 2, 0, 0, 1)])
    const selected = selectTile(state, 'a')
    expect(selectTile(selected, 'b')).toBe(selected)
    expect(legalPairs(state)).toEqual([])
  })

  it('distinguishes a dead end from victory', () => {
    const state = initialState([tile('a', 0, 0), tile('b', 1, 0, 0, 1), tile('c', 2, 0), tile('d', 3, 0, 0, 1)])
    expect(availableTiles(state)).toHaveLength(2)
    expect(gameStatus(state)).toBe('dead-end')
    expect(gameStatus(initialState([]))).toBe('won')
  })

  it('keeps varied legal play consistent across generated deals', () => {
    let sawDeadEnd = false
    for (let seed = 1; seed <= 100; seed++) {
      const random = randomFromSeed(seed)
      let state = initialState(createDeal(random).tiles)
      while (gameStatus(state) === 'playing') {
        const pairs = legalPairs(state)
        const [a, b] = pairs[Math.floor(random() * pairs.length)]
        state = selectTile(selectTile(state, a), b)
      }
      expect(['won', 'dead-end']).toContain(gameStatus(state))
      expect(state.history.length).toBeLessThanOrEqual(18)
      expect(state.removedIds).toHaveLength(state.history.length * 2)
      expect(legalPairs(state)).toEqual([])
      sawDeadEnd ||= gameStatus(state) === 'dead-end'
    }
    expect(sawDeadEnd).toBe(true)
  })
})
