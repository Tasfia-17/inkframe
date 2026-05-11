import { Link } from 'react-router-dom'

const PIPELINE = [
  { label: 'Show-Don\'t-Tell rewrite', desc: 'Emotion words become visual actions a camera can capture' },
  { label: 'Storyboard generation',   desc: 'gen4_image_turbo frames with style & character references' },
  { label: 'Scene animation',         desc: '5 video models, all scenes rendered in parallel' },
  { label: 'Narration & SFX',         desc: 'TTS voiceover + ambient sound effects per scene' },
  { label: 'Assembly & export',       desc: 'Subtitles, cinematic polish, final MP4 in 90 seconds' },
]

const APIS = [
  'gen4_image_turbo', 'gen4.5 text-to-video', 'gen4_turbo', 'veo3.1',
  'eleven_multilingual_v2', 'eleven_text_to_sound_v2', 'eleven_voice_isolation',
  'eleven_multilingual_sts_v2', 'gen4_aleph', 'eleven_voice_dubbing',
]

// ── Organic botanical SVGs ────────────────────────────────────────────────────

// A single daisy-like flower with organic petals
function Daisy({ cx = 0, cy = 0, r = 22, rotate = 0, opacity = 1 }: { cx?: number; cy?: number; r?: number; rotate?: number; opacity?: number }) {
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
        <path key={i} d={d} fill="#50B33A" opacity="0.55" stroke="#50B33A" strokeWidth="0.4"/>
      ))}
      <circle r="5" fill="#50B33A" opacity="0.9"/>
      <circle r="2.5" fill="#f7f4ed"/>
    </g>
  )
}

// A rose-like flower with layered petals
function Rose({ cx = 0, cy = 0, r = 20, rotate = 0, opacity = 1 }: { cx?: number; cy?: number; r?: number; rotate?: number; opacity?: number }) {
  return (
    <g transform={`translate(${cx},${cy}) rotate(${rotate})`} opacity={opacity}>
      {/* Outer petals */}
      <path d={`M0,0 C${r*0.3},-${r*0.8} ${r*0.9},-${r*0.9} ${r*0.7},-${r*0.2} C${r*0.5},${r*0.1} ${r*0.2},${r*0.05} 0,0`} fill="#50B33A" opacity="0.3" stroke="#50B33A" strokeWidth="0.5"/>
      <path d={`M0,0 C${r*0.8},-${r*0.3} ${r},-${r*0.1} ${r*0.6},${r*0.5} C${r*0.3},${r*0.7} ${r*0.1},${r*0.3} 0,0`} fill="#50B33A" opacity="0.3" stroke="#50B33A" strokeWidth="0.5"/>
      <path d={`M0,0 C${r*0.3},${r*0.8} ${r*0.1},${r} -${r*0.4},${r*0.7} C-${r*0.6},${r*0.4} -${r*0.2},${r*0.2} 0,0`} fill="#50B33A" opacity="0.3" stroke="#50B33A" strokeWidth="0.5"/>
      <path d={`M0,0 C-${r*0.8},${r*0.3} -${r},${r*0.1} -${r*0.7},-${r*0.5} C-${r*0.4},-${r*0.7} -${r*0.1},-${r*0.3} 0,0`} fill="#50B33A" opacity="0.3" stroke="#50B33A" strokeWidth="0.5"/>
      <path d={`M0,0 C-${r*0.3},-${r*0.8} -${r*0.1},-${r} ${r*0.4},-${r*0.7} C${r*0.6},-${r*0.4} ${r*0.2},-${r*0.2} 0,0`} fill="#50B33A" opacity="0.3" stroke="#50B33A" strokeWidth="0.5"/>
      {/* Inner petals */}
      <path d={`M0,0 C${r*0.2},-${r*0.5} ${r*0.6},-${r*0.5} ${r*0.4},0 C${r*0.2},${r*0.2} ${r*0.05},${r*0.1} 0,0`} fill="#50B33A" opacity="0.55"/>
      <path d={`M0,0 C${r*0.5},${r*0.2} ${r*0.5},${r*0.6} 0,${r*0.4} C-${r*0.2},${r*0.2} -${r*0.1},${r*0.05} 0,0`} fill="#50B33A" opacity="0.55"/>
      <path d={`M0,0 C-${r*0.2},${r*0.5} -${r*0.6},${r*0.5} -${r*0.4},0 C-${r*0.2},-${r*0.2} -${r*0.05},-${r*0.1} 0,0`} fill="#50B33A" opacity="0.55"/>
      <path d={`M0,0 C-${r*0.5},-${r*0.2} -${r*0.5},-${r*0.6} 0,-${r*0.4} C${r*0.2},-${r*0.2} ${r*0.1},-${r*0.05} 0,0`} fill="#50B33A" opacity="0.55"/>
      <circle r={r * 0.18} fill="#50B33A" opacity="0.9"/>
    </g>
  )
}

// Organic leaf shape
function Leaf({ x1 = 0, y1 = 0, x2 = 0, y2 = 0, flip = false, opacity = 0.35 }: { x1?: number; y1?: number; x2?: number; y2?: number; flip?: boolean; opacity?: number }) {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const dx = x2 - x1, dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy)
  const nx = -dy / len * 18 * (flip ? -1 : 1)
  const ny = dx / len * 18 * (flip ? -1 : 1)
  return (
    <path
      d={`M${x1},${y1} C${mx + nx * 0.3},${my + ny * 0.3} ${mx + nx},${my + ny} ${x2},${y2} C${mx + nx * 0.7},${my + ny * 0.5} ${mx},${my} ${x1},${y1}`}
      fill="#50B33A" opacity={opacity} stroke="#50B33A" strokeWidth="0.8"
    />
  )
}

// Full botanical stem with flowers
function BotanicalLeft() {
  return (
    <svg viewBox="0 0 200 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Main stem — organic curve */}
      <path d="M100 500 C98 450 94 400 100 350 C106 300 98 250 104 200 C110 150 102 100 108 50" stroke="#50B33A" strokeWidth="2" strokeLinecap="round"/>
      {/* Branch left */}
      <path d="M101 320 C85 308 65 300 42 296" stroke="#50B33A" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Branch right */}
      <path d="M103 230 C120 218 140 212 162 210" stroke="#50B33A" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Branch left low */}
      <path d="M100 400 C82 392 62 390 44 392" stroke="#50B33A" strokeWidth="1.2" strokeLinecap="round"/>

      {/* Leaves */}
      <Leaf x1={101} y1={320} x2={42} y2={296} flip={false} opacity={0.3}/>
      <Leaf x1={103} y1={230} x2={162} y2={210} flip={true} opacity={0.3}/>
      <Leaf x1={100} y1={400} x2={44} y2={392} flip={true} opacity={0.25}/>

      {/* Small leaves on main stem */}
      <path d="M102 270 C88 262 78 255 72 248 C82 248 94 256 102 270Z" fill="#50B33A" opacity="0.22" stroke="#50B33A" strokeWidth="0.7"/>
      <path d="M104 180 C118 172 128 165 134 158 C124 158 112 166 104 180Z" fill="#50B33A" opacity="0.22" stroke="#50B33A" strokeWidth="0.7"/>

      {/* Main flower top */}
      <Daisy cx={108} cy={50} r={26} rotate={15} opacity={1}/>

      {/* Flower on right branch */}
      <Daisy cx={162} cy={210} r={18} rotate={-20} opacity={0.9}/>

      {/* Bud on left branch */}
      <Rose cx={42} cy={296} r={12} rotate={10} opacity={0.85}/>

      {/* Tiny bud low */}
      <g transform="translate(44,392)">
        <path d="M0,0 C-4,-8 -2,-14 0,-16 C2,-14 4,-8 0,0Z" fill="#50B33A" opacity="0.6" stroke="#50B33A" strokeWidth="0.8"/>
        <path d="M0,0 C4,-6 8,-10 6,-14 C2,-10 0,-5 0,0Z" fill="#50B33A" opacity="0.45" stroke="#50B33A" strokeWidth="0.7"/>
        <path d="M0,0 C-4,-6 -8,-10 -6,-14 C-2,-10 0,-5 0,0Z" fill="#50B33A" opacity="0.45" stroke="#50B33A" strokeWidth="0.7"/>
      </g>

      {/* Extra small daisy mid-stem */}
      <Daisy cx={100} cy={150} r={14} rotate={5} opacity={0.75}/>
    </svg>
  )
}

function BotanicalRight() {
  return (
    <svg viewBox="0 0 200 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Main stem */}
      <path d="M100 500 C102 450 106 400 100 350 C94 300 102 250 96 200 C90 150 98 100 92 50" stroke="#50B33A" strokeWidth="2" strokeLinecap="round"/>
      {/* Branch right */}
      <path d="M99 320 C115 308 135 300 158 296" stroke="#50B33A" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Branch left */}
      <path d="M97 230 C80 218 60 212 38 210" stroke="#50B33A" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Branch right low */}
      <path d="M100 400 C118 392 138 390 156 392" stroke="#50B33A" strokeWidth="1.2" strokeLinecap="round"/>

      {/* Leaves */}
      <Leaf x1={99} y1={320} x2={158} y2={296} flip={true} opacity={0.3}/>
      <Leaf x1={97} y1={230} x2={38} y2={210} flip={false} opacity={0.3}/>
      <Leaf x1={100} y1={400} x2={156} y2={392} flip={false} opacity={0.25}/>

      {/* Small leaves */}
      <path d="M98 270 C112 262 122 255 128 248 C118 248 106 256 98 270Z" fill="#50B33A" opacity="0.22" stroke="#50B33A" strokeWidth="0.7"/>
      <path d="M96 180 C82 172 72 165 66 158 C76 158 88 166 96 180Z" fill="#50B33A" opacity="0.22" stroke="#50B33A" strokeWidth="0.7"/>

      {/* Main flower top — rose style */}
      <Rose cx={92} cy={50} r={26} rotate={-10} opacity={1}/>

      {/* Flower on left branch */}
      <Daisy cx={38} cy={210} r={18} rotate={20} opacity={0.9}/>

      {/* Bud on right branch */}
      <Rose cx={158} cy={296} r={12} rotate={-10} opacity={0.85}/>

      {/* Tiny bud low */}
      <g transform="translate(156,392)">
        <path d="M0,0 C-4,-8 -2,-14 0,-16 C2,-14 4,-8 0,0Z" fill="#50B33A" opacity="0.6" stroke="#50B33A" strokeWidth="0.8"/>
        <path d="M0,0 C4,-6 8,-10 6,-14 C2,-10 0,-5 0,0Z" fill="#50B33A" opacity="0.45" stroke="#50B33A" strokeWidth="0.7"/>
        <path d="M0,0 C-4,-6 -8,-10 -6,-14 C-2,-10 0,-5 0,0Z" fill="#50B33A" opacity="0.45" stroke="#50B33A" strokeWidth="0.7"/>
      </g>

      {/* Extra small rose mid-stem */}
      <Rose cx={100} cy={150} r={14} rotate={-5} opacity={0.75}/>
    </svg>
  )
}

function GardenDivider() {
  return (
    <svg viewBox="0 0 800 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
      {/* Vine */}
      <path d="M0 35 C80 30 160 40 240 35 C320 30 400 40 480 35 C560 30 640 40 720 35 C760 32 780 34 800 35"
        stroke="#50B33A" strokeWidth="1" strokeDasharray="5 7" opacity="0.35"/>
      {/* Leaves */}
      {[60,180,300,420,540,660].map((x, i) => (
        <g key={i} transform={`translate(${x},35)`}>
          <path
            d={i % 2 === 0
              ? "M0,0 C-4,-6 -10,-10 -14,-8 C-10,-2 -5,2 0,0Z"
              : "M0,0 C4,6 10,10 14,8 C10,2 5,-2 0,0Z"}
            fill="#50B33A" opacity="0.3" stroke="#50B33A" strokeWidth="0.7"
          />
        </g>
      ))}
      {/* Flowers along vine */}
      {[120, 280, 400, 520, 680].map((x, i) => (
        <g key={i}>
          {i % 2 === 0
            ? <Daisy cx={x} cy={35} r={10} rotate={i * 18} opacity={0.7}/>
            : <Rose cx={x} cy={35} r={9} rotate={i * 22} opacity={0.65}/>
          }
        </g>
      ))}
    </svg>
  )
}

function CornerSprig({ flip = false }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 130 130" fill="none" xmlns="http://www.w3.org/2000/svg"
      className={`w-28 h-28 opacity-50 ${flip ? 'scale-x-[-1]' : ''}`}>
      <path d="M10 120 C25 95 45 72 68 55 C88 40 108 28 122 18" stroke="#50B33A" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Side branch */}
      <path d="M38 88 C28 72 24 54 28 38" stroke="#50B33A" strokeWidth="1.2" strokeLinecap="round"/>
      <Leaf x1={38} y1={88} x2={28} y2={38} flip={false} opacity={0.28}/>
      {/* Another branch */}
      <path d="M72 52 C82 38 88 22 86 10" stroke="#50B33A" strokeWidth="1.2" strokeLinecap="round"/>
      <Leaf x1={72} y1={52} x2={86} y2={10} flip={true} opacity={0.28}/>
      {/* Flower at tip */}
      <Daisy cx={122} cy={18} r={14} rotate={30} opacity={0.85}/>
      {/* Small bud on branch */}
      <g transform="translate(28,38)">
        <path d="M0,0 C-3,-6 -1,-10 0,-12 C1,-10 3,-6 0,0Z" fill="#50B33A" opacity="0.55" stroke="#50B33A" strokeWidth="0.7"/>
        <path d="M0,0 C3,-4 6,-7 5,-10 C2,-7 0,-4 0,0Z" fill="#50B33A" opacity="0.4"/>
        <path d="M0,0 C-3,-4 -6,-7 -5,-10 C-2,-7 0,-4 0,0Z" fill="#50B33A" opacity="0.4"/>
      </g>
      {/* Rose at second branch tip */}
      <Rose cx={86} cy={10} r={11} rotate={-15} opacity={0.8}/>
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-vellum font-sans overflow-x-hidden">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-vellum/95 backdrop-blur border-b border-border px-6 py-3 flex items-center justify-between">
        <span className="font-serif text-xl text-charcoal tracking-tight">Inkframe</span>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm text-inkwell hover:text-charcoal transition-colors">Sign in</Link>
          <Link to="/register" className="btn-primary text-sm">Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-4 pt-16 pb-24 flex items-center justify-center min-h-[88vh]">
        {/* Left botanical */}
        <div className="absolute left-0 bottom-0 w-52 h-[480px] pointer-events-none select-none hidden lg:block">
          <BotanicalLeft />
        </div>
        {/* Right botanical */}
        <div className="absolute right-0 bottom-0 w-52 h-[480px] pointer-events-none select-none hidden lg:block">
          <BotanicalRight />
        </div>

        <div className="text-center max-w-2xl relative z-10">
          {/* Mobile sprigs */}
          <div className="flex justify-between mb-2 lg:hidden px-2">
            <CornerSprig />
            <CornerSprig flip />
          </div>

          <h1 className="font-serif text-6xl md:text-8xl text-charcoal leading-[1.0] tracking-tight mb-6">
            Your story,<br />
            <span className="italic">on screen.</span>
          </h1>

          <p className="text-lg text-mutedgray max-w-lg mx-auto leading-relaxed mb-10">
            Paste any story. Inkframe chains 10 Runway APIs to produce a narrated, scored, subtitled short film — in 90 seconds.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap mb-12">
            <Link to="/register" className="btn-primary px-8 py-3 text-base">Start writing →</Link>
            <Link to="/login" className="btn-secondary px-8 py-3 text-base">Sign in</Link>
          </div>

          <p className="text-xs text-mutedgray">
            10 Runway APIs · 8-stage pipeline · 29-language dubbing · No video editing required
          </p>
        </div>
      </section>

      {/* Garden divider */}
      <div className="max-w-4xl mx-auto px-6"><GardenDivider /></div>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 py-20 relative">
        <div className="absolute top-6 right-0 hidden md:block"><CornerSprig flip /></div>
        <h2 className="font-serif text-4xl text-charcoal mb-2">How it works</h2>
        <p className="text-mutedgray mb-12">Five stages. Zero manual steps.</p>
        <div className="space-y-0">
          {PIPELINE.map((step, i) => (
            <div key={i} className="flex items-start gap-6 py-6 border-b border-border last:border-0">
              <div className="w-8 h-8 rounded-full bg-charcoal text-white flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">{i + 1}</div>
              <div className="flex-1">
                <p className="font-medium text-charcoal text-sm mb-0.5">{step.label}</p>
                <p className="text-sm text-mutedgray">{step.desc}</p>
              </div>
              <span className="text-storygreen text-lg flex-shrink-0 mt-0.5">✦</span>
            </div>
          ))}
        </div>
      </section>

      {/* Garden divider */}
      <div className="max-w-4xl mx-auto px-6"><GardenDivider /></div>

      {/* API grid */}
      <section className="max-w-4xl mx-auto px-6 py-20 relative">
        <div className="absolute top-6 left-0 hidden md:block"><CornerSprig /></div>
        <h2 className="font-serif text-4xl text-charcoal mb-2">10 Runway APIs</h2>
        <p className="text-mutedgray mb-10">Not a single call — a full agentic pipeline.</p>
        <div className="flex flex-wrap gap-2">
          {APIS.map(api => (
            <span key={api} className="bg-white border border-border text-bookgray text-xs px-3 py-1.5 rounded-full font-mono hover:border-storygreen hover:text-storygreen transition-colors cursor-default">
              {api}
            </span>
          ))}
        </div>
      </section>

      {/* Garden divider */}
      <div className="max-w-4xl mx-auto px-6"><GardenDivider /></div>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="font-serif text-4xl text-charcoal mb-12">Everything included</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '✦', title: 'Story intelligence', body: 'Show-don\'t-tell rewrite, continuity extraction, and live quality scoring before a single frame is generated.' },
            { icon: '♪', title: 'Voice & audio',      body: '6 narrator voices, ambient SFX per scene, voice isolation, and speech-to-speech style conversion.' },
            { icon: '◈', title: 'Global reach',        body: 'One-click dubbing into 29 languages. Your film, everywhere.' },
            { icon: '▶', title: 'Visual control',      body: 'Upload style and character references. Every scene stays consistent.' },
            { icon: '✦', title: 'Real-time progress',  body: 'Watch each stage complete live — frames appearing, clips animating, audio mixing.' },
            { icon: '◈', title: 'AI Director',         body: 'Talk to a Runway Characters avatar that knows your story and can suggest scene changes.' },
          ].map(f => (
            <div key={f.title} className="card p-6 hover:shadow-md transition-shadow">
              <span className="text-storygreen text-lg block mb-3">{f.icon}</span>
              <h3 className="font-serif text-lg text-charcoal mb-2">{f.title}</h3>
              <p className="text-sm text-mutedgray leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="bg-charcoal rounded-3xl px-8 py-16 text-center relative overflow-hidden">
          <div className="absolute left-4 bottom-0 w-36 h-52 opacity-[0.07] pointer-events-none"><BotanicalLeft /></div>
          <div className="absolute right-4 bottom-0 w-36 h-52 opacity-[0.07] pointer-events-none"><BotanicalRight /></div>
          <div className="relative z-10">
            <h2 className="font-serif text-4xl text-white mb-4">Ready to make your film?</h2>
            <p className="text-[#9e9a91] mb-8 max-w-md mx-auto">Paste a story. Get a short film. No production team required.</p>
            <Link to="/register" className="inline-block bg-white text-charcoal font-medium px-8 py-3 rounded-full text-sm hover:bg-vellum transition-colors">
              Start for free →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-4xl mx-auto px-6 py-8 flex items-center justify-between text-xs text-mutedgray">
          <span className="font-serif text-sm text-charcoal">Inkframe</span>
          <span>© 2026 Tasfia Chowdhury</span>
        </div>
      </footer>
    </div>
  )
}
