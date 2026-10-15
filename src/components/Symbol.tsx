type SymbolProps = { face: number }

function Ring({ x, y, r, color }: { x: number; y: number; r: number; color: string }) {
  return <g fill="none" stroke={color} strokeWidth="3.5">
    <circle cx={x} cy={y} r={r} />
    <circle cx={x} cy={y} r={r * 0.45} strokeWidth="2" />
    <circle cx={x} cy={y} r="1.5" fill={color} stroke="none" />
  </g>
}

export function Symbol({ face }: SymbolProps) {
  let drawing
  switch (face) {
    case 0:
      drawing = <Ring x={30} y={38} r={18} color="#ad4a37" />
      break
    case 1:
      drawing = <><Ring x={22} y={24} r={11} color="#2e596b" /><Ring x={38} y={51} r={11} color="#2e596b" /></>
      break
    case 2:
      drawing = <><Ring x={30} y={18} r={9} color="#3c6c50" /><Ring x={17} y={49} r={9} color="#3c6c50" /><Ring x={43} y={49} r={9} color="#3c6c50" /></>
      break
    case 3:
    case 4:
    case 5: {
      const count = face - 2
      drawing = <g stroke="#3c6c50" strokeLinecap="round">
        {Array.from({ length: count }, (_, i) => {
          const x = 30 + (i - (count - 1) / 2) * 17
          return <g key={i}>
            <path d={`M${x} 17 V59`} strokeWidth="6" />
            {[22, 38, 54].map((y) => <path key={y} d={`M${x - 4} ${y} H${x + 4}`} stroke="#eadcc1" strokeWidth="2" />)}
            <path d={`M${x} 28 Q${x - 11} 19 ${x - 7} 14 M${x} 45 Q${x + 10} 36 ${x + 7} 31`} fill="none" strokeWidth="2" />
          </g>
        })}
      </g>
      break
    }
    case 6:
      drawing = <g fill="#ad4a37">
        {[0, 72, 144, 216, 288].map((angle) => <ellipse key={angle} cx="30" cy="24" rx="9" ry="14" transform={`rotate(${angle} 30 38)`} />)}
        <circle cx="30" cy="38" r="7" fill="#f4e8cd" />
        <circle cx="30" cy="38" r="3" fill="#ad4a37" />
      </g>
      break
    case 7:
      drawing = <g stroke="#3c6c50" strokeWidth="2.5" strokeLinejoin="round">
        <path d="M13 56 C3 32 22 16 46 13 C56 36 39 59 13 56Z" fill="#3c6c50" />
        <path d="M12 61 43 20 M24 45 20 31 M31 36 43 34" fill="none" stroke="#f4e8cd" />
      </g>
      break
    default:
      drawing = <g stroke="#2e596b" strokeWidth="3" strokeLinejoin="round">
        <path d="m30 11 21 27-21 27L9 38Z" fill="none" />
        <path d="m30 22 12 16-12 16-12-16Z" fill="#2e596b" />
        <path d="M30 7V3 M30 73v-4" strokeWidth="2" />
      </g>
  }
  return <svg viewBox="0 0 60 76" aria-hidden="true" className="pointer-events-none h-[82%] w-[82%]">{drawing}</svg>
}
