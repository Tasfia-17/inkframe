import { Daisy, Rose, Tulip, Poppy, Wildflower, Bud, Leaf } from './Flowers'

export function BotanicalLeft() {
  return (
    <svg viewBox="0 0 260 580" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* ── Stem 1 (center) ── */}
      <path d="M120 580 C118 520 114 460 120 400 C126 340 118 280 124 220 C130 160 120 110 126 55" stroke="#50B33A" strokeWidth="2" strokeLinecap="round"/>
      <path d="M121 370 C102 356 80 348 56 344" stroke="#50B33A" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M123 280 C142 266 164 260 188 258" stroke="#50B33A" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M120 460 C100 452 78 450 58 452" stroke="#50B33A" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M122 190 C140 178 160 172 180 170" stroke="#50B33A" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M123 320 C110 312 96 308 82 308" stroke="#50B33A" strokeWidth="1" strokeLinecap="round"/>
      <Leaf x1={121} y1={370} x2={56} y2={344} flip={false} opacity={0.28}/>
      <Leaf x1={123} y1={280} x2={188} y2={258} flip={true} opacity={0.28}/>
      <Leaf x1={120} y1={460} x2={58} y2={452} flip={true} opacity={0.22}/>
      <Leaf x1={122} y1={190} x2={180} y2={170} flip={false} opacity={0.22}/>
      <path d="M122 500 C106 492 92 490 80 492 C94 484 108 488 122 500Z" fill="#50B33A" opacity="0.2" stroke="#50B33A" strokeWidth="0.6"/>
      <path d="M124 240 C138 232 150 226 158 220 C146 220 134 228 124 240Z" fill="#50B33A" opacity="0.2" stroke="#50B33A" strokeWidth="0.6"/>
      <Daisy cx={126} cy={55} r={28} rotate={12} opacity={1}/>
      <Tulip cx={150} cy={70} r={18} rotate={15} opacity={0.9}/>
      <Poppy cx={188} cy={258} r={20} rotate={-18} opacity={0.9}/>
      <Wildflower cx={180} cy={170} r={16} rotate={8} opacity={0.85}/>
      <Rose cx={56} cy={344} r={16} rotate={10} opacity={0.9}/>
      <Bud cx={58} cy={452} r={11} rotate={-5} opacity={0.85}/>
      <Bud cx={72} cy={446} r={9} rotate={10} opacity={0.75}/>
      <Daisy cx={82} cy={308} r={13} rotate={-8} opacity={0.8}/>
      <Tulip cx={120} cy={150} r={15} rotate={-5} opacity={0.8}/>
      <Wildflower cx={118} cy={220} r={12} rotate={20} opacity={0.7}/>
      <Bud cx={106} cy={75} r={10} rotate={-15} opacity={0.75}/>

      {/* ── Stem 2 (left offset, shorter) ── */}
      <path d="M55 580 C53 530 50 480 56 430 C62 380 54 330 60 285 C66 240 58 200 62 165" stroke="#50B33A" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M57 400 C42 390 26 385 10 384" stroke="#50B33A" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M59 320 C72 310 84 306 96 305" stroke="#50B33A" strokeWidth="1.1" strokeLinecap="round"/>
      <path d="M58 460 C44 454 28 452 14 454" stroke="#50B33A" strokeWidth="1" strokeLinecap="round"/>
      <Leaf x1={57} y1={400} x2={10} y2={384} flip={false} opacity={0.22}/>
      <Leaf x1={59} y1={320} x2={96} y2={305} flip={true} opacity={0.22}/>
      <path d="M57 350 C44 344 34 342 24 344 C34 336 46 340 57 350Z" fill="#50B33A" opacity="0.18" stroke="#50B33A" strokeWidth="0.5"/>
      <Rose cx={62} cy={165} r={22} rotate={-8} opacity={0.95}/>
      <Wildflower cx={10} cy={384} r={14} rotate={15} opacity={0.85}/>
      <Tulip cx={96} cy={305} r={12} rotate={-12} opacity={0.8}/>
      <Bud cx={14} cy={454} r={9} rotate={5} opacity={0.75}/>
      <Daisy cx={44} cy={178} r={13} rotate={20} opacity={0.75}/>
    </svg>
  )
}

export function BotanicalRight() {
  return (
    <svg viewBox="0 0 260 580" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* ── Stem 1 (center) ── */}
      <path d="M140 580 C142 520 146 460 140 400 C134 340 142 280 136 220 C130 160 140 110 134 55" stroke="#50B33A" strokeWidth="2" strokeLinecap="round"/>
      <path d="M139 370 C158 356 180 348 204 344" stroke="#50B33A" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M137 280 C118 266 96 260 72 258" stroke="#50B33A" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M140 460 C160 452 182 450 202 452" stroke="#50B33A" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M138 190 C120 178 100 172 80 170" stroke="#50B33A" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M137 320 C150 312 164 308 178 308" stroke="#50B33A" strokeWidth="1" strokeLinecap="round"/>
      <Leaf x1={139} y1={370} x2={204} y2={344} flip={true} opacity={0.28}/>
      <Leaf x1={137} y1={280} x2={72} y2={258} flip={false} opacity={0.28}/>
      <Leaf x1={140} y1={460} x2={202} y2={452} flip={false} opacity={0.22}/>
      <Leaf x1={138} y1={190} x2={80} y2={170} flip={true} opacity={0.22}/>
      <path d="M138 500 C154 492 168 490 180 492 C166 484 152 488 138 500Z" fill="#50B33A" opacity="0.2" stroke="#50B33A" strokeWidth="0.6"/>
      <path d="M136 240 C122 232 110 226 102 220 C114 220 126 228 136 240Z" fill="#50B33A" opacity="0.2" stroke="#50B33A" strokeWidth="0.6"/>
      <Rose cx={134} cy={55} r={28} rotate={-12} opacity={1}/>
      <Wildflower cx={110} cy={68} r={18} rotate={-18} opacity={0.9}/>
      <Poppy cx={72} cy={258} r={20} rotate={20} opacity={0.9}/>
      <Daisy cx={80} cy={170} r={16} rotate={-10} opacity={0.85}/>
      <Tulip cx={204} cy={344} r={16} rotate={-8} opacity={0.9}/>
      <Bud cx={202} cy={452} r={11} rotate={5} opacity={0.85}/>
      <Bud cx={188} cy={446} r={9} rotate={-10} opacity={0.75}/>
      <Rose cx={178} cy={308} r={13} rotate={12} opacity={0.8}/>
      <Daisy cx={140} cy={150} r={15} rotate={8} opacity={0.8}/>
      <Tulip cx={142} cy={220} r={12} rotate={-20} opacity={0.7}/>
      <Bud cx={154} cy={72} r={10} rotate={18} opacity={0.75}/>

      {/* ── Stem 2 (right offset, shorter) ── */}
      <path d="M205 580 C207 530 210 480 204 430 C198 380 206 330 200 285 C194 240 202 200 198 165" stroke="#50B33A" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M203 400 C218 390 234 385 250 384" stroke="#50B33A" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M201 320 C188 310 176 306 164 305" stroke="#50B33A" strokeWidth="1.1" strokeLinecap="round"/>
      <path d="M202 460 C216 454 232 452 246 454" stroke="#50B33A" strokeWidth="1" strokeLinecap="round"/>
      <Leaf x1={203} y1={400} x2={250} y2={384} flip={true} opacity={0.22}/>
      <Leaf x1={201} y1={320} x2={164} y2={305} flip={false} opacity={0.22}/>
      <path d="M203 350 C216 344 226 342 236 344 C226 336 214 340 203 350Z" fill="#50B33A" opacity="0.18" stroke="#50B33A" strokeWidth="0.5"/>
      <Daisy cx={198} cy={165} r={22} rotate={10} opacity={0.95}/>
      <Poppy cx={250} cy={384} r={14} rotate={-15} opacity={0.85}/>
      <Rose cx={164} cy={305} r={12} rotate={8} opacity={0.8}/>
      <Bud cx={246} cy={454} r={9} rotate={-5} opacity={0.75}/>
      <Wildflower cx={216} cy={178} r={13} rotate={-20} opacity={0.75}/>
    </svg>
  )
}

export function GardenDivider() {
  return (
    <svg viewBox="0 0 800 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
      <path d="M0 40 C80 34 160 46 240 40 C320 34 400 46 480 40 C560 34 640 46 720 40 C760 37 780 39 800 40"
        stroke="#50B33A" strokeWidth="1" strokeDasharray="5 7" opacity="0.3"/>
      {[50,170,290,410,530,650,750].map((x, i) => (
        <g key={i} transform={`translate(${x},40)`}>
          <path d={i%2===0 ? "M0,0 C-3,-5 -9,-9 -13,-7 C-9,-1 -4,2 0,0Z" : "M0,0 C3,5 9,9 13,7 C9,1 4,-2 0,0Z"}
            fill="#50B33A" opacity="0.28" stroke="#50B33A" strokeWidth="0.6"/>
        </g>
      ))}
      <Daisy cx={110} cy={40} r={11} rotate={0} opacity={0.65}/>
      <Tulip cx={230} cy={40} r={10} rotate={5} opacity={0.65}/>
      <Rose cx={360} cy={40} r={10} rotate={-8} opacity={0.65}/>
      <Wildflower cx={480} cy={40} r={10} rotate={12} opacity={0.65}/>
      <Poppy cx={600} cy={40} r={11} rotate={-5} opacity={0.65}/>
      <Daisy cx={720} cy={40} r={9} rotate={20} opacity={0.6}/>
    </svg>
  )
}

export function CornerSprig({ flip = false }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg"
      className={`w-28 h-28 opacity-50 ${flip ? 'scale-x-[-1]' : ''}`}>
      <path d="M10 130 C28 102 50 78 74 60 C94 44 114 30 128 18" stroke="#50B33A" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M40 96 C30 78 26 58 30 40" stroke="#50B33A" strokeWidth="1.2" strokeLinecap="round"/>
      <Leaf x1={40} y1={96} x2={30} y2={40} flip={false} opacity={0.25}/>
      <path d="M78 56 C88 40 92 22 90 8" stroke="#50B33A" strokeWidth="1.2" strokeLinecap="round"/>
      <Leaf x1={78} y1={56} x2={90} y2={8} flip={true} opacity={0.25}/>
      <Daisy cx={128} cy={18} r={14} rotate={25} opacity={0.85}/>
      <Tulip cx={114} cy={10} r={11} rotate={-10} opacity={0.75}/>
      <Bud cx={138} cy={30} r={9} rotate={15} opacity={0.7}/>
      <Rose cx={30} cy={40} r={12} rotate={-12} opacity={0.8}/>
      <Wildflower cx={90} cy={8} r={10} rotate={8} opacity={0.75}/>
    </svg>
  )
}

// ── Petal rain ────────────────────────────────────────────────────────────────
const PETALS = [
  // [left%, animClass, dur(s), delay(s), size(px), rotate]
  [8,  'petal-1', 7,  0,   10, 20],
  [15, 'petal-2', 9,  1.5, 8,  -30],
  [22, 'petal-3', 11, 0.5, 12, 45],
  [30, 'petal-1', 8,  3,   9,  -15],
  [38, 'petal-2', 10, 0.8, 7,  60],
  [47, 'petal-3', 7,  2.2, 11, -45],
  [55, 'petal-1', 9,  1,   8,  30],
  [63, 'petal-2', 12, 3.5, 10, -20],
  [70, 'petal-3', 8,  0.3, 9,  50],
  [78, 'petal-1', 10, 2,   7,  -60],
  [85, 'petal-2', 7,  1.2, 12, 15],
  [92, 'petal-3', 9,  4,   8,  -35],
] as const

export function PetalRain() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {PETALS.map(([left, cls, dur, delay, size, rot], i) => (
        <div
          key={i}
          className={cls}
          style={{
            position: 'absolute',
            left: `${left}%`,
            top: '-20px',
            '--dur': `${dur}s`,
            '--delay': `${delay}s`,
          } as React.CSSProperties}
        >
          <svg width={size} height={size * 1.4} viewBox="0 0 10 14" fill="none"
            style={{ transform: `rotate(${rot}deg)` }}>
            <path d="M5,0 C8,2 9,6 7,10 C6,12 4,13 3,12 C1,10 1,6 3,3 C4,1 5,0 5,0Z"
              fill="#50B33A" opacity="0.45"/>
          </svg>
        </div>
      ))}
    </div>
  )
}
  return (
    <svg viewBox="0 0 220 560" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Main stem */}
      <path d="M110 560 C108 500 104 440 110 380 C116 320 108 260 114 200 C120 140 110 90 116 40" stroke="#50B33A" strokeWidth="2" strokeLinecap="round"/>
      {/* Branch left-1 */}
      <path d="M111 350 C92 336 70 328 46 324" stroke="#50B33A" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Branch right-1 */}
      <path d="M113 260 C132 246 154 240 178 238" stroke="#50B33A" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Branch left-2 */}
      <path d="M110 440 C90 432 68 430 48 432" stroke="#50B33A" strokeWidth="1.2" strokeLinecap="round"/>
      {/* Branch right-2 */}
      <path d="M112 170 C130 158 150 152 170 150" stroke="#50B33A" strokeWidth="1.2" strokeLinecap="round"/>
      {/* Branch left-3 short */}
      <path d="M113 300 C100 292 86 288 72 288" stroke="#50B33A" strokeWidth="1" strokeLinecap="round"/>

      {/* Leaves */}
      <Leaf x1={111} y1={350} x2={46} y2={324} flip={false} opacity={0.28}/>
      <Leaf x1={113} y1={260} x2={178} y2={238} flip={true} opacity={0.28}/>
      <Leaf x1={110} y1={440} x2={48} y2={432} flip={true} opacity={0.22}/>
      <Leaf x1={112} y1={170} x2={170} y2={150} flip={false} opacity={0.22}/>
      {/* Stem leaves */}
      <path d="M112 480 C96 472 82 470 70 472 C84 464 98 468 112 480Z" fill="#50B33A" opacity="0.2" stroke="#50B33A" strokeWidth="0.6"/>
      <path d="M114 220 C128 212 140 206 148 200 C136 200 124 208 114 220Z" fill="#50B33A" opacity="0.2" stroke="#50B33A" strokeWidth="0.6"/>

      {/* Flowers — dense bouquet */}
      {/* Top: big daisy */}
      <Daisy cx={116} cy={40} r={28} rotate={12} opacity={1}/>
      {/* Beside top: tulip */}
      <Tulip cx={140} cy={55} r={18} rotate={15} opacity={0.9}/>
      {/* Right branch: poppy */}
      <Poppy cx={178} cy={238} r={20} rotate={-18} opacity={0.9}/>
      {/* Right branch-2: wildflower */}
      <Wildflower cx={170} cy={150} r={16} rotate={8} opacity={0.85}/>
      {/* Left branch: rose */}
      <Rose cx={46} cy={324} r={16} rotate={10} opacity={0.9}/>
      {/* Left branch-2: bud cluster */}
      <Bud cx={48} cy={432} r={11} rotate={-5} opacity={0.85}/>
      <Bud cx={62} cy={426} r={9} rotate={10} opacity={0.75}/>
      {/* Short branch: daisy small */}
      <Daisy cx={72} cy={288} r={13} rotate={-8} opacity={0.8}/>
      {/* Mid-stem: tulip */}
      <Tulip cx={110} cy={130} r={15} rotate={-5} opacity={0.8}/>
      {/* Mid-stem: wildflower */}
      <Wildflower cx={108} cy={200} r={12} rotate={20} opacity={0.7}/>
      {/* Extra bud near top */}
      <Bud cx={96} cy={60} r={10} rotate={-15} opacity={0.75}/>
    </svg>
  )
}

export function BotanicalRight() {
  return (
    <svg viewBox="0 0 220 560" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Main stem */}
      <path d="M110 560 C112 500 116 440 110 380 C104 320 112 260 106 200 C100 140 110 90 104 40" stroke="#50B33A" strokeWidth="2" strokeLinecap="round"/>
      {/* Branch right-1 */}
      <path d="M109 350 C128 336 150 328 174 324" stroke="#50B33A" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Branch left-1 */}
      <path d="M107 260 C88 246 66 240 42 238" stroke="#50B33A" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Branch right-2 */}
      <path d="M110 440 C130 432 152 430 172 432" stroke="#50B33A" strokeWidth="1.2" strokeLinecap="round"/>
      {/* Branch left-2 */}
      <path d="M108 170 C90 158 70 152 50 150" stroke="#50B33A" strokeWidth="1.2" strokeLinecap="round"/>
      {/* Branch right-3 short */}
      <path d="M107 300 C120 292 134 288 148 288" stroke="#50B33A" strokeWidth="1" strokeLinecap="round"/>

      {/* Leaves */}
      <Leaf x1={109} y1={350} x2={174} y2={324} flip={true} opacity={0.28}/>
      <Leaf x1={107} y1={260} x2={42} y2={238} flip={false} opacity={0.28}/>
      <Leaf x1={110} y1={440} x2={172} y2={432} flip={false} opacity={0.22}/>
      <Leaf x1={108} y1={170} x2={50} y2={150} flip={true} opacity={0.22}/>
      <path d="M108 480 C124 472 138 470 150 472 C136 464 122 468 108 480Z" fill="#50B33A" opacity="0.2" stroke="#50B33A" strokeWidth="0.6"/>
      <path d="M106 220 C92 212 80 206 72 200 C84 200 96 208 106 220Z" fill="#50B33A" opacity="0.2" stroke="#50B33A" strokeWidth="0.6"/>

      {/* Flowers */}
      {/* Top: rose */}
      <Rose cx={104} cy={40} r={28} rotate={-12} opacity={1}/>
      {/* Beside top: wildflower */}
      <Wildflower cx={80} cy={52} r={18} rotate={-18} opacity={0.9}/>
      {/* Left branch: poppy */}
      <Poppy cx={42} cy={238} r={20} rotate={20} opacity={0.9}/>
      {/* Left branch-2: daisy */}
      <Daisy cx={50} cy={150} r={16} rotate={-10} opacity={0.85}/>
      {/* Right branch: tulip */}
      <Tulip cx={174} cy={324} r={16} rotate={-8} opacity={0.9}/>
      {/* Right branch-2: bud cluster */}
      <Bud cx={172} cy={432} r={11} rotate={5} opacity={0.85}/>
      <Bud cx={158} cy={426} r={9} rotate={-10} opacity={0.75}/>
      {/* Short branch: rose small */}
      <Rose cx={148} cy={288} r={13} rotate={12} opacity={0.8}/>
      {/* Mid-stem: daisy */}
      <Daisy cx={110} cy={130} r={15} rotate={8} opacity={0.8}/>
      {/* Mid-stem: tulip */}
      <Tulip cx={112} cy={200} r={12} rotate={-20} opacity={0.7}/>
      {/* Extra bud near top */}
      <Bud cx={124} cy={58} r={10} rotate={18} opacity={0.75}/>
    </svg>
  )
}

export function GardenDivider() {
  return (
    <svg viewBox="0 0 800 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
      <path d="M0 40 C80 34 160 46 240 40 C320 34 400 46 480 40 C560 34 640 46 720 40 C760 37 780 39 800 40"
        stroke="#50B33A" strokeWidth="1" strokeDasharray="5 7" opacity="0.3"/>
      {/* Leaves alternating */}
      {[50,170,290,410,530,650,750].map((x, i) => (
        <g key={i} transform={`translate(${x},40)`}>
          <path d={i%2===0 ? "M0,0 C-3,-5 -9,-9 -13,-7 C-9,-1 -4,2 0,0Z" : "M0,0 C3,5 9,9 13,7 C9,1 4,-2 0,0Z"}
            fill="#50B33A" opacity="0.28" stroke="#50B33A" strokeWidth="0.6"/>
        </g>
      ))}
      {/* Mixed flowers */}
      <Daisy cx={110} cy={40} r={11} rotate={0} opacity={0.65}/>
      <Tulip cx={230} cy={40} r={10} rotate={5} opacity={0.65}/>
      <Rose cx={360} cy={40} r={10} rotate={-8} opacity={0.65}/>
      <Wildflower cx={480} cy={40} r={10} rotate={12} opacity={0.65}/>
      <Poppy cx={600} cy={40} r={11} rotate={-5} opacity={0.65}/>
      <Daisy cx={720} cy={40} r={9} rotate={20} opacity={0.6}/>
    </svg>
  )
}

export function CornerSprig({ flip = false }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg"
      className={`w-28 h-28 opacity-50 ${flip ? 'scale-x-[-1]' : ''}`}>
      <path d="M10 130 C28 102 50 78 74 60 C94 44 114 30 128 18" stroke="#50B33A" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M40 96 C30 78 26 58 30 40" stroke="#50B33A" strokeWidth="1.2" strokeLinecap="round"/>
      <Leaf x1={40} y1={96} x2={30} y2={40} flip={false} opacity={0.25}/>
      <path d="M78 56 C88 40 92 22 90 8" stroke="#50B33A" strokeWidth="1.2" strokeLinecap="round"/>
      <Leaf x1={78} y1={56} x2={90} y2={8} flip={true} opacity={0.25}/>
      {/* Three flowers at tip cluster */}
      <Daisy cx={128} cy={18} r={14} rotate={25} opacity={0.85}/>
      <Tulip cx={114} cy={10} r={11} rotate={-10} opacity={0.75}/>
      <Bud cx={138} cy={30} r={9} rotate={15} opacity={0.7}/>
      {/* Branch flowers */}
      <Rose cx={30} cy={40} r={12} rotate={-12} opacity={0.8}/>
      <Wildflower cx={90} cy={8} r={10} rotate={8} opacity={0.75}/>
    </svg>
  )
}
