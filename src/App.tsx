import { useRef } from 'react'
import { Board } from './components/Board'
import { Icon } from './components/Icon'
import { Symbol } from './components/Symbol'
import { gameStatus, legalPairs } from './game/engine'
import { gameStore, useGame } from './game/useGame'
import text from './messages.json'

const controlClass = 'flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#d8d9ca] bg-[#fbfaf5] px-3 py-3 text-xs font-medium text-[#365344] transition-colors hover:border-[#81917a] hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#356648] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#d8d9ca] disabled:hover:bg-[#fbfaf5] sm:px-5 sm:text-sm'

export default function App() {
  const status = useGame(gameStatus)
  const canUndo = useGame((state) => state.history.length > 0)
  const canHint = useGame((state) => legalPairs(state).length > 0)
  const hasHint = useGame((state) => state.hintPair !== null)
  const hasSelection = useGame((state) => state.selectedId !== null)
  const instructions = useRef<HTMLDialogElement>(null)
  const recovery = useRef<HTMLButtonElement>(null)

  function reset(action: 'restart' | 'newGame') {
    const current = gameStore.getState()
    const hasProgress = current.history.length > 0 && gameStatus(current) !== 'won'
    if (hasProgress && !window.confirm(action === 'restart' ? text.confirmRestart : text.confirmNewGame)) return
    current[action]()
  }

  const message = status === 'won' ? text.won : status === 'dead-end' ? text.deadEnd
    : hasHint ? text.hintShown : hasSelection ? text.selected : text.playing

  return <div className="min-h-screen bg-[#f6f4ed] text-[#293f34]">
    <a href="#game" className="sr-only z-50 rounded-lg bg-white p-3 focus:not-sr-only focus:fixed focus:left-3 focus:top-3">{text.skipToGame}</a>
    <header className="mx-auto flex max-w-5xl items-center justify-between gap-3 border-b border-[#dddcd1] px-5 py-5 sm:px-8 sm:py-6">
      <div className="flex items-center gap-2.5">
        <div aria-hidden="true" className="flex h-10 w-8 -rotate-6 items-center justify-center rounded-md border border-[#d3cbb6] bg-[#fcf8ed] shadow-[1px_3px_0_#d3cbb6]"><Symbol face={7} /></div>
        <span className="font-serif text-lg tracking-tight sm:text-xl">{text.title}</span>
      </div>
      <button type="button" onClick={() => instructions.current?.showModal()} className="flex min-h-11 items-center gap-2 rounded-lg px-2 text-xs text-[#4f6255] hover:bg-[#eaece1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#356648] sm:text-sm">
        <Icon name="help" />{text.howToPlay}
      </button>
    </header>

    <main className="mx-auto max-w-[880px] px-4 pb-8 pt-8 sm:px-8 sm:pb-12 sm:pt-11">
      <div className="mb-7 text-center sm:mb-9">
        <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.25em] text-[#66755c]">{text.eyebrow}</p>
        <h1 className="font-serif text-[32px] leading-tight tracking-[-0.035em] sm:text-[44px]">{text.subtitle}</h1>
      </div>

      <Board recoveryRef={recovery} />

      <div role="status" aria-live="polite" aria-atomic="true" className="flex min-h-[90px] flex-col items-center justify-center px-2 py-4 text-center sm:min-h-[88px]">
        {status !== 'playing' ? <h2 className="mb-1 font-serif text-2xl">{status === 'won' ? text.wonTitle : text.deadEndTitle}</h2> : null}
        <p className="text-xs leading-relaxed text-[#586851] sm:text-sm">{message}</p>
      </div>

      <nav aria-label={text.controlsLabel} className="mx-auto grid max-w-xl grid-cols-4 gap-2 sm:gap-3">
        <button type="button" disabled={!canHint} onClick={() => gameStore.getState().hint()} className={controlClass}><Icon name="hint" />{text.hint}</button>
        <button type="button" ref={canUndo ? recovery : undefined} disabled={!canUndo} onClick={() => gameStore.getState().undo()} className={controlClass}><Icon name="undo" />{text.undo}</button>
        <button type="button" onClick={() => reset('restart')} className={controlClass}><Icon name="restart" />{text.restart}</button>
        <button type="button" ref={!canUndo ? recovery : undefined} onClick={() => reset('newGame')} className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[#244e3e] bg-[#244e3e] px-2 py-3 text-xs font-medium text-[#faf5e8] transition-colors hover:bg-[#163d2e] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#356648] sm:gap-2 sm:px-5 sm:text-sm"><Icon name="plus" />{text.newGame}</button>
      </nav>

      <p className="mt-8 text-center text-[11px] tracking-wide text-[#6c7963] sm:mt-10">{text.footer}</p>
    </main>

    <footer className="mx-auto flex max-w-5xl items-center justify-center border-t border-[#dddcd1] px-5 py-5">
      <a href="https://github.com/AugustoAleGon/cardjo" target="_blank" rel="noreferrer" className="rounded text-[10px] uppercase tracking-[0.16em] text-[#64715c] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#356648]">{text.repository}</a>
    </footer>

    <dialog ref={instructions} aria-labelledby="instructions-title" className="m-auto max-h-[85dvh] w-[calc(100%-32px)] max-w-lg overflow-auto rounded-2xl border border-[#ddd6c4] bg-[#faf8f0] p-6 text-[#293f34] shadow-xl backdrop:bg-[#122f25]/65 sm:p-8">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 id="instructions-title" className="font-serif text-3xl">{text.howToPlay}</h2>
        <button type="button" autoFocus onClick={() => instructions.current?.close()} aria-label={text.closeInstructions} className="flex size-11 items-center justify-center rounded-full border border-[#d8d9ca] hover:bg-white focus-visible:outline-2 focus-visible:outline-[#356648]"><Icon name="close" /></button>
      </div>
      <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed marker:text-[#73805f]">
        {text.instructions.map((instruction) => <li key={instruction} className="pl-1">{instruction}</li>)}
      </ol>
      <p className="mt-6 border-t border-[#dddcd1] pt-5 text-xs leading-relaxed text-[#586851]">{text.instructionsNote}</p>
    </dialog>
  </div>
}
