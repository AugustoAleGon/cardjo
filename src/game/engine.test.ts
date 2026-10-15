import { describe, expect, it } from 'vitest'
import { createDeal, gameStatus, initialState, isAvailable, LAYOUT, selectTile, SOLUTION } from './engine'

describe('starting deals', () => {
  it('contains 36 unique positions and four copies of each face', () => {
    const deal = createDeal(() => 0.5)
    expect(deal).toHaveLength(36)
    expect(new Set(deal.map((tile) => tile.id)).size).toBe(36)
    for (let face = 0; face < 9; face++) expect(deal.filter((tile) => tile.face === face)).toHaveLength(4)
    expect(LAYOUT.filter((tile) => tile.z === 0)).toHaveLength(24)
  })

  it.each([0, 0.1, 0.5, 0.999999])('clears the known solution with random input %s', (value) => {
    let state = initialState(createDeal(() => value))
    for (const [first, second] of SOLUTION) {
      state = selectTile(selectTile(state, first), second)
    }
    expect(state.removedIds).toHaveLength(36)
    expect(state.history).toHaveLength(18)
    expect(gameStatus(state)).toBe('won')
  })

  it('blocks covered tiles and tiles with two occupied sides', () => {
    const deal = createDeal(() => 0)
    expect(isAvailable(deal.find((tile) => tile.id === '0:0:1')!, deal)).toBe(false)
    expect(isAvailable(deal.find((tile) => tile.id === '1:0.5:2')!, deal)).toBe(false)
    expect(isAvailable(deal.find((tile) => tile.id === '1:0.5:1')!, deal)).toBe(true)
  })
})
