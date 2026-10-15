export type IconName = 'hint' | 'undo' | 'restart' | 'plus' | 'help' | 'close'

const paths: Record<IconName, string> = {
  hint: 'M9 18h6M10 21h4M8.5 14.5a6 6 0 1 1 7 0c-1 .7-1.5 1.5-1.5 3.5h-4c0-2-.5-2.8-1.5-3.5ZM12 2v1M3 10H2M22 10h-1M5 4l1 1M19 4l-1 1',
  undo: 'M8 4 3 9l5 5M3 9h10a6 6 0 0 1 0 12',
  restart: 'M3 11a9 9 0 1 1 2.7 7M3 4v7h7',
  plus: 'M12 5v14M5 12h14',
  help: 'M9.5 8a2.5 2.5 0 1 1 4.3 1.7c-1.2 1-1.8 1.3-1.8 3.3M12 16v.1M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  close: 'M6 6l12 12M18 6 6 18',
}

export function Icon({ name, className = 'size-4 shrink-0' }: { name: IconName; className?: string }) {
  return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={paths[name]} />
  </svg>
}
