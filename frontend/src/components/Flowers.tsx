// ── Botanical SVG components ──────────────────────────────────────────────────

export function Daisy({ cx = 0, cy = 0, r = 22, rotate = 0, opacity = 1 }: { cx?: number; cy?: number; r?: number; rotate?: number; opacity?: number }) {
  const petals = [
    "M0,-1 C3,-8 8,-14 0,-18 C-8,-14 -3,-8 0,-1",
    "M1,-1 C8,-5 14,-8 12,-16 C5,-12 3,-6 1,-1",
    "M1,0 C8,3 14,6 16,0 C12,-6 6,-4 1,0",
    "M1,1 C8,5 12,12 6,16 C0,12 0,6 1,1",
    "M0,1 C3,8 2,15 -4,16 C-8,10 -4,5 0,1",
    "M-1,1 C-8,5 -14,8 -14,2 C-10,-4 -5,-1 -1,1",
    "M-1,0 C-8,-3 -14,-6 -12,-14 C-5,-10 -3,-4 -1,0",
    "M-1,-1 C-8,-5 -10,-12 -4,-16 C0,-12 0,-5 -1,-1",
  ]
  return (
    <g transform={`translate(${cx},${cy}) rotate(${rotate}) scale(${r / 18})`} opacity={opacity}>
      {petals.map((d, i) => (
        <path key={i} d={d} fill="#50B33A" opacity="0.5" stroke="#50B33A" strokeWidth="0.4"/>
      ))}
      <circle r="5" fill="#50B33A" opacity="0.9"/>
      <circle r="2.5" fill="#f7f4ed"/>
    </g>
  )
}

export function Rose({ cx = 0, cy = 0, r = 20, rotate = 0, opacity = 1 }: { cx?: number; cy?: number; r?: number; rotate?: number; opacity?: number }) {
  return (
    <g transform={`translate(${cx},${cy}) rotate(${rotate})`} opacity={opacity}>
      <path d={`M0,0 C${r*.3},-${r*.8} ${r*.9},-${r*.9} ${r*.7},-${r*.2} C${r*.5},${r*.1} ${r*.2},${r*.05} 0,0`} fill="#50B33A" opacity="0.28" stroke="#50B33A" strokeWidth="0.5"/>
      <path d={`M0,0 C${r*.8},-${r*.3} ${r},-${r*.1} ${r*.6},${r*.5} C${r*.3},${r*.7} ${r*.1},${r*.3} 0,0`} fill="#50B33A" opacity="0.28" stroke="#50B33A" strokeWidth="0.5"/>
      <path d={`M0,0 C${r*.3},${r*.8} ${r*.1},${r} -${r*.4},${r*.7} C-${r*.6},${r*.4} -${r*.2},${r*.2} 0,0`} fill="#50B33A" opacity="0.28" stroke="#50B33A" strokeWidth="0.5"/>
      <path d={`M0,0 C-${r*.8},${r*.3} -${r},${r*.1} -${r*.7},-${r*.5} C-${r*.4},-${r*.7} -${r*.1},-${r*.3} 0,0`} fill="#50B33A" opacity="0.28" stroke="#50B33A" strokeWidth="0.5"/>
      <path d={`M0,0 C-${r*.3},-${r*.8} -${r*.1},-${r} ${r*.4},-${r*.7} C${r*.6},-${r*.4} ${r*.2},-${r*.2} 0,0`} fill="#50B33A" opacity="0.28" stroke="#50B33A" strokeWidth="0.5"/>
      <path d={`M0,0 C${r*.2},-${r*.5} ${r*.6},-${r*.5} ${r*.4},0 C${r*.2},${r*.2} ${r*.05},${r*.1} 0,0`} fill="#50B33A" opacity="0.55"/>
      <path d={`M0,0 C${r*.5},${r*.2} ${r*.5},${r*.6} 0,${r*.4} C-${r*.2},${r*.2} -${r*.1},${r*.05} 0,0`} fill="#50B33A" opacity="0.55"/>
      <path d={`M0,0 C-${r*.2},${r*.5} -${r*.6},${r*.5} -${r*.4},0 C-${r*.2},-${r*.2} -${r*.05},-${r*.1} 0,0`} fill="#50B33A" opacity="0.55"/>
      <path d={`M0,0 C-${r*.5},-${r*.2} -${r*.5},-${r*.6} 0,-${r*.4} C${r*.2},-${r*.2} ${r*.1},-${r*.05} 0,0`} fill="#50B33A" opacity="0.55"/>
      <circle r={r * 0.18} fill="#50B33A" opacity="0.9"/>
    </g>
  )
}

// Tulip — 3 cupped petals
export function Tulip({ cx = 0, cy = 0, r = 18, rotate = 0, opacity = 1 }: { cx?: number; cy?: number; r?: number; rotate?: number; opacity?: number }) {
  return (
    <g transform={`translate(${cx},${cy}) rotate(${rotate}) scale(${r / 18})`} opacity={opacity}>
      {/* Left petal */}
      <path d="M0,2 C-6,-2 -12,-8 -10,-16 C-6,-14 -2,-8 0,2Z" fill="#50B33A" opacity="0.45" stroke="#50B33A" strokeWidth="0.5"/>
      {/* Right petal */}
      <path d="M0,2 C6,-2 12,-8 10,-16 C6,-14 2,-8 0,2Z" fill="#50B33A" opacity="0.45" stroke="#50B33A" strokeWidth="0.5"/>
      {/* Center petal */}
      <path d="M0,2 C-4,-4 -4,-12 0,-18 C4,-12 4,-4 0,2Z" fill="#50B33A" opacity="0.7" stroke="#50B33A" strokeWidth="0.5"/>
      {/* Sepal */}
      <path d="M-3,2 C-2,6 2,6 3,2 C1,4 -1,4 -3,2Z" fill="#50B33A" opacity="0.5"/>
    </g>
  )
}

// Poppy — 4 wide ruffled petals
export function Poppy({ cx = 0, cy = 0, r = 20, rotate = 0, opacity = 1 }: { cx?: number; cy?: number; r?: number; rotate?: number; opacity?: number }) {
  return (
    <g transform={`translate(${cx},${cy}) rotate(${rotate}) scale(${r / 20})`} opacity={opacity}>
      <path d="M0,0 C-4,-6 -14,-10 -18,-6 C-16,0 -8,2 0,0Z" fill="#50B33A" opacity="0.35" stroke="#50B33A" strokeWidth="0.5"/>
      <path d="M0,0 C4,-6 14,-10 18,-6 C16,0 8,2 0,0Z" fill="#50B33A" opacity="0.35" stroke="#50B33A" strokeWidth="0.5"/>
      <path d="M0,0 C-4,6 -14,10 -18,6 C-16,0 -8,-2 0,0Z" fill="#50B33A" opacity="0.35" stroke="#50B33A" strokeWidth="0.5"/>
      <path d="M0,0 C4,6 14,10 18,6 C16,0 8,-2 0,0Z" fill="#50B33A" opacity="0.35" stroke="#50B33A" strokeWidth="0.5"/>
      {/* Ruffled inner */}
      <path d="M0,0 C-3,-8 -2,-14 0,-16 C2,-14 3,-8 0,0Z" fill="#50B33A" opacity="0.55"/>
      <path d="M0,0 C8,-3 14,-2 16,0 C14,2 8,3 0,0Z" fill="#50B33A" opacity="0.55"/>
      <path d="M0,0 C3,8 2,14 0,16 C-2,14 -3,8 0,0Z" fill="#50B33A" opacity="0.55"/>
      <path d="M0,0 C-8,3 -14,2 -16,0 C-14,-2 -8,-3 0,0Z" fill="#50B33A" opacity="0.55"/>
      <circle r="4" fill="#50B33A" opacity="0.9"/>
      <circle r="2" fill="#f7f4ed" opacity="0.6"/>
    </g>
  )
}

// Wildflower — 5 thin pointed petals
export function Wildflower({ cx = 0, cy = 0, r = 16, rotate = 0, opacity = 1 }: { cx?: number; cy?: number; r?: number; rotate?: number; opacity?: number }) {
  const angles = [0, 72, 144, 216, 288]
  return (
    <g transform={`translate(${cx},${cy}) rotate(${rotate}) scale(${r / 16})`} opacity={opacity}>
      {angles.map((a, i) => {
        const rad = (a * Math.PI) / 180
        const x = Math.sin(rad) * 14
        const y = -Math.cos(rad) * 14
        const cx1 = Math.sin(rad - 0.3) * 8
        const cy1 = -Math.cos(rad - 0.3) * 8
        const cx2 = Math.sin(rad + 0.3) * 8
        const cy2 = -Math.cos(rad + 0.3) * 8
        return (
          <path key={i}
            d={`M0,0 C${cx1},${cy1} ${cx2},${cy2} ${x},${y} C${cx2},${cy2} ${cx1},${cy1} 0,0`}
            fill="#50B33A" opacity="0.5" stroke="#50B33A" strokeWidth="0.4"
          />
        )
      })}
      <circle r="3.5" fill="#50B33A" opacity="0.9"/>
      <circle r="1.5" fill="#f7f4ed"/>
    </g>
  )
}

// Bud — closed flower bud
export function Bud({ cx = 0, cy = 0, r = 10, rotate = 0, opacity = 1 }: { cx?: number; cy?: number; r?: number; rotate?: number; opacity?: number }) {
  return (
    <g transform={`translate(${cx},${cy}) rotate(${rotate}) scale(${r / 10})`} opacity={opacity}>
      <path d="M0,2 C-4,-2 -5,-8 0,-12 C5,-8 4,-2 0,2Z" fill="#50B33A" opacity="0.65" stroke="#50B33A" strokeWidth="0.6"/>
      <path d="M0,2 C3,-1 6,-6 4,-11 C1,-8 0,-4 0,2Z" fill="#50B33A" opacity="0.4"/>
      <path d="M0,2 C-3,-1 -6,-6 -4,-11 C-1,-8 0,-4 0,2Z" fill="#50B33A" opacity="0.4"/>
      <path d="M-2,2 C-1,5 1,5 2,2 C0,4 0,4 -2,2Z" fill="#50B33A" opacity="0.5"/>
    </g>
  )
}

// Organic leaf
export function Leaf({ x1 = 0, y1 = 0, x2 = 0, y2 = 0, flip = false, opacity = 0.3 }: { x1?: number; y1?: number; x2?: number; y2?: number; flip?: boolean; opacity?: number }) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2
  const dx = x2 - x1, dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy)
  const nx = -dy / len * 18 * (flip ? -1 : 1)
  const ny = dx / len * 18 * (flip ? -1 : 1)
  return (
    <path d={`M${x1},${y1} C${mx+nx*.3},${my+ny*.3} ${mx+nx},${my+ny} ${x2},${y2} C${mx+nx*.7},${my+ny*.5} ${mx},${my} ${x1},${y1}`}
      fill="#50B33A" opacity={opacity} stroke="#50B33A" strokeWidth="0.8"/>
  )
}
