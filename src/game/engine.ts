export type Tile = Readonly<{ id: string; face: number; x: number; y: number; z: number }>
export type Pair = readonly [string, string]
export type RandomSource = () => number
export type Deal = Readonly<{ tiles: readonly Tile[]; solution: readonly Pair[] }>
export type GameState = Readonly<{
  startingDeal: readonly Tile[]
  removedIds: readonly string[]
  selectedId: string | null
  hintPair: Pair | null
  history: readonly Pair[]
}>

const positionId = (x: number, y: number, z: number) => `${z}:${y}:${x}`

export const LAYOUT: readonly Omit<Tile, 'face'>[] = [
  ...Array.from({ length: 24 }, (_, i) => {
    const x = i % 6
    const y = Math.floor(i / 6)
    return { id: positionId(x, y, 0), x, y, z: 0 }
  }),
  ...Array.from({ length: 12 }, (_, i) => {
    const x = i % 4 + 1
    const y = Math.floor(i / 4) + 0.5
    return { id: positionId(x, y, 1), x, y, z: 1 }
  }),
]

export function createDeal(random: RandomSource = Math.random): Deal {
  let remaining = LAYOUT.map((position) => ({ ...position, face: 0 }))
  const solution: Pair[] = []
  while (remaining.length > 0) {
    // Clear each layer before the next. This prevents a lone tile from covering the final tile.
    const layer = Math.max(...remaining.map((tile) => tile.z))
    const available = remaining.filter((tile) => tile.z === layer && isAvailable(tile, remaining))
    const first = available.splice(Math.floor(random() * available.length), 1)[0]
    const second = available[Math.floor(random() * available.length)]
    solution.push([first.id, second.id])
    remaining = remaining.filter((tile) => tile.id !== first.id && tile.id !== second.id)
  }
  const faces = Array.from({ length: 18 }, (_, i) => i % 9)
  for (let i = faces.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[faces[i], faces[j]] = [faces[j], faces[i]]
  }
  const assigned = new Map<string, number>()
  solution.forEach((pair, i) => pair.forEach((id) => assigned.set(id, faces[i])))
  return { tiles: LAYOUT.map((position) => ({ ...position, face: assigned.get(position.id)! })), solution }
}

export function initialState(deal: readonly Tile[]): GameState {
  return { startingDeal: deal, removedIds: [], selectedId: null, hintPair: null, history: [] }
}

export function remainingTiles(state: GameState): readonly Tile[] {
  const removed = new Set(state.removedIds)
  return state.startingDeal.filter((tile) => !removed.has(tile.id))
}

export function isAvailable(tile: Tile, remaining: readonly Tile[]): boolean {
  if (!remaining.some((other) => other.id === tile.id)) return false
  const overlapsY = (other: Tile) => Math.abs(other.y - tile.y) < 1
  if (remaining.some((other) => other.z > tile.z && overlapsY(other) && Math.abs(other.x - tile.x) < 1)) {
    return false
  }
  const sideBlocked = (side: number) => remaining.some((other) =>
    other.z === tile.z && other.x === tile.x + side && overlapsY(other),
  )
  return !sideBlocked(-1) || !sideBlocked(1)
}

export function availableTiles(state: GameState): readonly Tile[] {
  const remaining = remainingTiles(state)
  return remaining.filter((tile) => isAvailable(tile, remaining))
}

export function legalPairs(state: GameState): readonly Pair[] {
  const available = availableTiles(state)
  const pairs: Pair[] = []
  available.forEach((tile, i) => {
    for (const other of available.slice(i + 1)) {
      if (tile.face === other.face) pairs.push([tile.id, other.id])
    }
  })
  return pairs
}

export function gameStatus(state: GameState): 'playing' | 'won' | 'dead-end' {
  if (remainingTiles(state).length === 0) return 'won'
  return legalPairs(state).length === 0 ? 'dead-end' : 'playing'
}

export function selectTile(state: GameState, id: string): GameState {
  const available = availableTiles(state)
  const tile = available.find((candidate) => candidate.id === id)
  if (!tile) return state
  if (state.selectedId === id) return { ...state, selectedId: null, hintPair: null }
  const selected = available.find((candidate) => candidate.id === state.selectedId)
  if (!selected || selected.face !== tile.face) {
    return { ...state, selectedId: id, hintPair: null }
  }
  const pair: Pair = [selected.id, tile.id]
  return {
    ...state,
    removedIds: [...state.removedIds, ...pair],
    history: [...state.history, pair],
    selectedId: null,
    hintPair: null,
  }
}

export function undo(state: GameState): GameState {
  const pair = state.history.at(-1)
  if (!pair) return state
  return {
    ...state,
    removedIds: state.removedIds.filter((id) => !pair.includes(id)),
    history: state.history.slice(0, -1),
    selectedId: null,
    hintPair: null,
  }
}

export function hint(state: GameState): GameState {
  const pair = legalPairs(state)[0]
  return pair ? { ...state, hintPair: pair, selectedId: null } : state
}

export function nextDeal(previous: readonly Tile[], random: RandomSource): readonly Tile[] {
  const deal = createDeal(random).tiles
  return deal.every((tile, i) => tile.face === previous[i]?.face)
    ? deal.map((tile) => ({ ...tile, face: (tile.face + 1) % 9 }))
    : deal
}
