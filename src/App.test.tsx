// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { createDeal, initialState } from './game/engine'
import type { Tile } from './game/engine'
import { gameStore } from './game/useGame'
import text from './messages.json'

const deal = createDeal(() => 0.5)

function clickTile(id: string) {
  const button = document.querySelector(`[data-tile-id="${id}"]`)
  expect(button).not.toBeNull()
  fireEvent.click(button!, { detail: 1 })
}

function removeFirstPair() {
  clickTile(deal.solution[0][0])
  clickTile(deal.solution[0][1])
}

beforeEach(() => {
  gameStore.setState(initialState(deal.tiles))
  vi.spyOn(window, 'confirm').mockReturnValue(false)
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('game interface', () => {
  it('removes a clicked pair and restores it with Undo', () => {
    render(<App />)
    expect((screen.getByRole('button', { name: text.undo }) as HTMLButtonElement).disabled).toBe(true)
    removeFirstPair()
    expect(document.querySelectorAll('[data-tile-id]')).toHaveLength(34)
    expect(document.querySelectorAll('[data-selected="true"]')).toHaveLength(0)
    fireEvent.click(screen.getByRole('button', { name: text.undo }))
    expect(document.querySelectorAll('[data-tile-id]')).toHaveLength(36)
    expect(gameStore.getState().startingDeal).toBe(deal.tiles)
  })

  it('highlights two available tiles and announces the hint', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: text.hint }))
    const hinted = document.querySelectorAll<HTMLButtonElement>('[data-hinted="true"]')
    expect(hinted).toHaveLength(2)
    expect(Array.from(hinted).every((button) => !button.disabled)).toBe(true)
    expect(screen.getByRole('status').textContent).toContain(text.hintShown)
    fireEvent.click(hinted[0], { detail: 1 })
    expect(document.querySelectorAll('[data-hinted="true"]')).toHaveLength(0)
  })

  it.each([
    [text.restart, text.confirmRestart],
    [text.newGame, text.confirmNewGame],
  ])('preserves all state when %s is canceled', (label, confirmation) => {
    render(<App />)
    removeFirstPair()
    fireEvent.click(screen.getByRole('button', { name: text.hint }))
    const before = gameStore.getState()
    fireEvent.click(screen.getByRole('button', { name: label }))
    expect(window.confirm).toHaveBeenCalledWith(confirmation)
    expect(gameStore.getState()).toBe(before)
    expect(document.querySelectorAll('[data-tile-id]')).toHaveLength(34)
    expect(document.querySelectorAll('[data-hinted="true"]')).toHaveLength(2)
  })

  it.each([text.restart, text.newGame])('resets progress when %s is confirmed', (label) => {
    vi.mocked(window.confirm).mockReturnValue(true)
    render(<App />)
    removeFirstPair()
    fireEvent.click(screen.getByRole('button', { name: text.hint }))
    fireEvent.click(screen.getByRole('button', { name: label }))
    expect(window.confirm).toHaveBeenCalledOnce()
    const state = gameStore.getState()
    expect(state.history).toEqual([])
    expect(state.removedIds).toEqual([])
    expect(state.selectedId).toBeNull()
    expect(state.hintPair).toBeNull()
    expect(document.querySelectorAll('[data-tile-id]')).toHaveLength(36)
    if (label === text.restart) expect(state.startingDeal).toBe(deal.tiles)
    else expect(state.startingDeal).not.toEqual(deal.tiles)
  })

  it('announces victory and permits undo', () => {
    gameStore.setState({ removedIds: deal.tiles.map((tile) => tile.id), history: deal.solution })
    render(<App />)
    expect(screen.getByRole('status').textContent).toContain(text.won)
    expect((screen.getByRole('button', { name: text.hint }) as HTMLButtonElement).disabled).toBe(true)
    expect((screen.getByRole('button', { name: text.undo }) as HTMLButtonElement).disabled).toBe(false)
    fireEvent.click(screen.getByRole('button', { name: text.undo }))
    expect(document.querySelectorAll('[data-tile-id]')).toHaveLength(2)
    expect(screen.getByRole('status').textContent).toContain(text.playing)
  })

  it('offers recovery at a dead end', () => {
    const tiles: Tile[] = [
      { id: 'a', x: 0, y: 0, z: 0, face: 0 },
      { id: 'b', x: 1, y: 0, z: 0, face: 1 },
      { id: 'c', x: 2, y: 0, z: 0, face: 0 },
      { id: 'd', x: 3, y: 0, z: 0, face: 1 },
      { id: 'e', x: 0, y: 2, z: 0, face: 2 },
      { id: 'f', x: 1, y: 2, z: 0, face: 2 },
    ]
    gameStore.setState(initialState(tiles))
    gameStore.getState().selectTile('e')
    gameStore.getState().selectTile('f')
    render(<App />)
    expect(screen.getByRole('status').textContent).toContain(text.deadEnd)
    expect((screen.getByRole('button', { name: text.hint }) as HTMLButtonElement).disabled).toBe(true)
    for (const name of [text.undo, text.restart, text.newGame]) {
      expect((screen.getByRole('button', { name }) as HTMLButtonElement).disabled).toBe(false)
    }
    fireEvent.click(screen.getByRole('button', { name: text.undo }))
    expect(screen.getByRole('status').textContent).toContain(text.playing)
  })

  it('does not request confirmation before progress or after victory', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: text.restart }))
    act(() => gameStore.setState({ removedIds: deal.tiles.map((tile) => tile.id), history: deal.solution }))
    fireEvent.click(screen.getByRole('button', { name: text.newGame }))
    expect(window.confirm).not.toHaveBeenCalled()
    expect(document.querySelectorAll('[data-tile-id]')).toHaveLength(36)
  })
})
