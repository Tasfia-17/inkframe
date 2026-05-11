import { Daisy, Rose, Tulip, Poppy, Wildflower, Bud, Leaf } from './Flowers'

export function BotanicalLeft() {
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
