import { useRef } from 'react'
import type { CSSProperties, MouseEvent, RefObject } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { availableTiles, legalPairs, remainingTiles } from '../game/engine'
import { gameStore, useGame } from '../game/useGame'
import text from '../messages.json'
import { Symbol } from './Symbol'

export function Board({ recoveryRef }: { recoveryRef: RefObject<HTMLButtonElement | null> }) {
  const tiles = useGame(useShallow(remainingTiles))
  const availableIds = useGame(useShallow((state) => availableTiles(state).map((tile) => tile.id)))
  const selectedId = useGame((state) => state.selectedId)
  const hintPair = useGame((state) => state.hintPair)
  const pairCount = useGame((state) => legalPairs(state).length)
  const buttons = useRef(new Map<string, HTMLButtonElement>())

  function select(id: string, event: MouseEvent<HTMLButtonElement>) {
    const before = gameStore.getState().history.length
    gameStore.getState().selectTile(id)
    if (event.detail === 0 && gameStore.getState().history.length > before) {
      requestAnimationFrame(() => {
        const first = availableTiles(gameStore.getState())[0]
        if (first) buttons.current.get(first.id)?.focus()
        else recoveryRef.current?.focus()
      })
    }
  }

  return <section id="game" tabIndex={-1} aria-label={text.boardLabel} className="board-surface relative overflow-hidden rounded-[22px] border border-[#28594b] bg-[#164b3e] px-3 pb-6 pt-6 text-[#f7f0de] shadow-[0_15px_45px_-24px_#163e35aa] sm:px-10 sm:pb-9 sm:pt-8">
    <div className="relative z-10 mb-5 flex items-center justify-between gap-4 px-2 sm:mb-7">
      <div className="flex items-center gap-3">
        <span className="font-serif text-[32px] leading-none tabular-nums sm:text-4xl">{tiles.length.toString().padStart(2, '0')}</span>
        <span className="max-w-16 text-[10px] font-medium uppercase leading-relaxed tracking-[0.14em] text-[#d0dccb]">{text.remainingLabel}</span>
      </div>
      <div className="flex items-center gap-2 rounded-full border border-white/15 px-3 py-2 text-[11px] text-[#dce6d8] sm:text-xs">
        <span className="size-1.5 rounded-full bg-[#d9bd79]" aria-hidden="true" />
        <span>{pairCount} {text.pairsLabel.toLowerCase()}</span>
      </div>
    </div>
    <div className="board-frame relative z-10 mx-auto">
      <div className="board-geometry" style={{ '--board-scale': 'calc(100cqw / 6.4)' } as CSSProperties}>
        {tiles.map((tile) => {
          const available = availableIds.includes(tile.id)
          const selected = selectedId === tile.id
          const hinted = hintPair?.includes(tile.id) ?? false
          const stateLabel = selected ? text.selectedLabel : hinted ? text.hinted : available ? text.available : text.blocked
          const label = text.tileLabel.replace('{face}', text.faces[tile.face])
            .replace('{row}', String(tile.y + (tile.z === 0 ? 1 : 0.5))).replace('{column}', String(tile.x + 1))
            .replace('{layer}', String(tile.z + 1)).replace('{state}', stateLabel)
          return <button
            key={tile.id}
            type="button"
            ref={(node) => { if (node) buttons.current.set(tile.id, node); else buttons.current.delete(tile.id) }}
            className="mahjong-tile absolute flex items-center justify-center rounded-[7px] border border-[#ded3b6] bg-[#faf4e6] text-[#214b3d] outline-offset-4 transition-[filter,box-shadow] duration-150 focus-visible:outline-3 focus-visible:outline-[#ffffff] disabled:cursor-default sm:rounded-[9px]"
            style={{ '--x': tile.x, '--y': tile.y, '--z': tile.z, zIndex: tile.z * 100 + tile.y * 2 } as CSSProperties}
            data-tile-id={tile.id}
            data-selected={selected}
            data-hinted={hinted}
            disabled={!available}
            aria-pressed={selected}
            aria-label={label}
            onClick={(event) => select(tile.id, event)}
          >
            <Symbol face={tile.face} />
            <span aria-hidden="true" className="tile-corner absolute left-[8%] top-[5%] font-serif text-[0.65em] leading-none opacity-55">{tile.face < 6 ? tile.face % 3 + 1 : '·'}</span>
          </button>
        })}
      </div>
    </div>
    <div aria-hidden="true" className="relative mt-3 flex items-center justify-center gap-4 text-[9px] uppercase tracking-[0.26em] text-[#d2dec8]/70 sm:mt-5">
      <span className="h-px w-9 bg-current opacity-40" />{text.layoutLabel}<span className="h-px w-9 bg-current opacity-40" />
    </div>
  </section>
}
