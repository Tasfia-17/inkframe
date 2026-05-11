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

// ── Botanical SVG illustrations ───────────────────────────────────────────────

function FlowerLeft() {
  return (
    <svg viewBox="0 0 220 420" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Main stem */}
      <path d="M110 420 C108 360 105 300 112 240 C118 180 108 120 115 60" stroke="#50B33A" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Left branch */}
      <path d="M112 280 C90 265 65 255 40 248" stroke="#50B33A" strokeWidth="1.8" strokeLinecap="round"/>
      {/* Right branch */}
      <path d="M114 220 C138 205 162 198 188 194" stroke="#50B33A" strokeWidth="1.8" strokeLinecap="round"/>
      {/* Left leaf */}
      <path d="M112 280 C95 268 72 258 40 248 C58 242 82 245 112 280Z" fill="#50B33A" opacity="0.25"/>
      <path d="M112 280 C95 268 72 258 40 248 C58 242 82 245 112 280Z" stroke="#50B33A" strokeWidth="1.2"/>
      {/* Right leaf */}
      <path d="M114 220 C132 208 158 200 188 194 C172 188 148 192 114 220Z" fill="#50B33A" opacity="0.25"/>
      <path d="M114 220 C132 208 158 200 188 194 C172 188 148 192 114 220Z" stroke="#50B33A" strokeWidth="1.2"/>
      {/* Small left leaf */}
      <path d="M111 340 C92 330 70 328 50 330 C65 322 88 325 111 340Z" fill="#50B33A" opacity="0.18"/>
      <path d="M111 340 C92 330 70 328 50 330 C65 322 88 325 111 340Z" stroke="#50B33A" strokeWidth="1"/>
      {/* Big flower head */}
      <circle cx="115" cy="60" r="28" fill="#f7f4ed" stroke="#50B33A" strokeWidth="1.5"/>
      {/* Petals */}
      {[0,45,90,135,180,225,270,315].map((angle, i) => (
        <ellipse key={i}
          cx={115 + Math.cos((angle * Math.PI) / 180) * 26}
          cy={60 + Math.sin((angle * Math.PI) / 180) * 26}
          rx="10" ry="6"
          transform={`rotate(${angle} ${115 + Math.cos((angle * Math.PI) / 180) * 26} ${60 + Math.sin((angle * Math.PI) / 180) * 26})`}
          fill="#50B33A" opacity="0.35" stroke="#50B33A" strokeWidth="0.8"
        />
      ))}
      <circle cx="115" cy="60" r="12" fill="#50B33A" opacity="0.7"/>
      <circle cx="115" cy="60" r="6" fill="#f7f4ed"/>
      {/* Small bud on right branch */}
      <circle cx="188" cy="194" r="8" fill="#f7f4ed" stroke="#50B33A" strokeWidth="1.2"/>
      {[0,60,120,180,240,300].map((angle, i) => (
        <ellipse key={i}
          cx={188 + Math.cos((angle * Math.PI) / 180) * 9}
          cy={194 + Math.sin((angle * Math.PI) / 180) * 9}
          rx="5" ry="3.5"
          transform={`rotate(${angle} ${188 + Math.cos((angle * Math.PI) / 180) * 9} ${194 + Math.sin((angle * Math.PI) / 180) * 9})`}
          fill="#50B33A" opacity="0.3" stroke="#50B33A" strokeWidth="0.6"
        />
      ))}
      <circle cx="188" cy="194" r="5" fill="#50B33A" opacity="0.5"/>
    </svg>
  )
}

function FlowerRight() {
  return (
    <svg viewBox="0 0 220 420" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Main stem */}
      <path d="M110 420 C112 360 115 300 108 240 C102 180 112 120 105 60" stroke="#50B33A" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Right branch */}
      <path d="M108 280 C130 265 155 255 180 248" stroke="#50B33A" strokeWidth="1.8" strokeLinecap="round"/>
      {/* Left branch */}
      <path d="M106 220 C82 205 58 198 32 194" stroke="#50B33A" strokeWidth="1.8" strokeLinecap="round"/>
      {/* Right leaf */}
      <path d="M108 280 C125 268 148 258 180 248 C162 242 138 245 108 280Z" fill="#50B33A" opacity="0.25"/>
      <path d="M108 280 C125 268 148 258 180 248 C162 242 138 245 108 280Z" stroke="#50B33A" strokeWidth="1.2"/>
      {/* Left leaf */}
      <path d="M106 220 C88 208 62 200 32 194 C48 188 72 192 106 220Z" fill="#50B33A" opacity="0.25"/>
      <path d="M106 220 C88 208 62 200 32 194 C48 188 72 192 106 220Z" stroke="#50B33A" strokeWidth="1.2"/>
      {/* Small right leaf */}
      <path d="M109 340 C128 330 150 328 170 330 C155 322 132 325 109 340Z" fill="#50B33A" opacity="0.18"/>
      <path d="M109 340 C128 330 150 328 170 330 C155 322 132 325 109 340Z" stroke="#50B33A" strokeWidth="1"/>
      {/* Big flower — slightly different, more open */}
      <circle cx="105" cy="60" r="30" fill="#f7f4ed" stroke="#50B33A" strokeWidth="1.5"/>
      {[22,67,112,157,202,247,292,337].map((angle, i) => (
        <ellipse key={i}
          cx={105 + Math.cos((angle * Math.PI) / 180) * 28}
          cy={60 + Math.sin((angle * Math.PI) / 180) * 28}
          rx="11" ry="6.5"
          transform={`rotate(${angle} ${105 + Math.cos((angle * Math.PI) / 180) * 28} ${60 + Math.sin((angle * Math.PI) / 180) * 28})`}
          fill="#50B33A" opacity="0.3" stroke="#50B33A" strokeWidth="0.8"
        />
      ))}
      <circle cx="105" cy="60" r="13" fill="#50B33A" opacity="0.65"/>
      <circle cx="105" cy="60" r="6" fill="#f7f4ed"/>
      {/* Small bud on left branch */}
      <circle cx="32" cy="194" r="7" fill="#f7f4ed" stroke="#50B33A" strokeWidth="1.2"/>
      {[0,60,120,180,240,300].map((angle, i) => (
        <ellipse key={i}
          cx={32 + Math.cos((angle * Math.PI) / 180) * 8}
          cy={194 + Math.sin((angle * Math.PI) / 180) * 8}
          rx="4.5" ry="3"
          transform={`rotate(${angle} ${32 + Math.cos((angle * Math.PI) / 180) * 8} ${194 + Math.sin((angle * Math.PI) / 180) * 8})`}
          fill="#50B33A" opacity="0.28" stroke="#50B33A" strokeWidth="0.6"
        />
      ))}
      <circle cx="32" cy="194" r="4.5" fill="#50B33A" opacity="0.5"/>
    </svg>
  )
}

function GardenDivider() {
  return (
    <svg viewBox="0 0 800 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
      {/* Horizontal vine */}
      <path d="M0 30 C100 28 200 32 300 30 C400 28 500 32 600 30 C700 28 750 30 800 30"
        stroke="#50B33A" strokeWidth="1.2" strokeDasharray="4 6" opacity="0.4"/>
      {/* Small leaves along vine */}
      {[80, 200, 320, 440, 560, 680].map((x, i) => (
        <g key={i}>
          <ellipse cx={x} cy={i % 2 === 0 ? 22 : 38} rx="10" ry="5"
            transform={`rotate(${i % 2 === 0 ? -30 : 30} ${x} ${i % 2 === 0 ? 22 : 38})`}
            fill="#50B33A" opacity="0.25" stroke="#50B33A" strokeWidth="0.8"/>
        </g>
      ))}
      {/* Small flowers */}
      {[140, 400, 660].map((x, i) => (
        <g key={i}>
          <circle cx={x} cy="30" r="5" fill="#f7f4ed" stroke="#50B33A" strokeWidth="1"/>
          {[0,72,144,216,288].map((angle, j) => (
            <ellipse key={j}
              cx={x + Math.cos((angle * Math.PI) / 180) * 7}
              cy={30 + Math.sin((angle * Math.PI) / 180) * 7}
              rx="3.5" ry="2"
              transform={`rotate(${angle} ${x + Math.cos((angle * Math.PI) / 180) * 7} ${30 + Math.sin((angle * Math.PI) / 180) * 7})`}
              fill="#50B33A" opacity="0.35"/>
          ))}
          <circle cx={x} cy="30" r="3" fill="#50B33A" opacity="0.6"/>
        </g>
      ))}
    </svg>
  )
}

function CornerSprig({ flip = false }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"
      className={`w-24 h-24 opacity-40 ${flip ? 'scale-x-[-1]' : ''}`}>
      <path d="M10 110 C20 85 35 65 55 50 C70 38 90 28 110 20" stroke="#50B33A" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M30 90 C22 75 18 58 20 42" stroke="#50B33A" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M30 90 C22 75 18 58 20 42 C28 55 32 72 30 90Z" fill="#50B33A" opacity="0.2"/>
      <path d="M60 62 C72 55 82 42 88 28" stroke="#50B33A" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M60 62 C72 55 82 42 88 28 C80 38 70 52 60 62Z" fill="#50B33A" opacity="0.2"/>
      <circle cx="110" cy="20" r="6" fill="#f7f4ed" stroke="#50B33A" strokeWidth="1"/>
      {[0,72,144,216,288].map((angle, i) => (
        <ellipse key={i}
          cx={110 + Math.cos((angle * Math.PI) / 180) * 8}
          cy={20 + Math.sin((angle * Math.PI) / 180) * 8}
          rx="4" ry="2.5"
          transform={`rotate(${angle} ${110 + Math.cos((angle * Math.PI) / 180) * 8} ${20 + Math.sin((angle * Math.PI) / 180) * 8})`}
          fill="#50B33A" opacity="0.4"/>
      ))}
      <circle cx="110" cy="20" r="3.5" fill="#50B33A" opacity="0.6"/>
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

      {/* Hero — full-width with flanking flowers */}
      <section className="relative max-w-6xl mx-auto px-4 pt-16 pb-24 flex items-center justify-center min-h-[85vh]">
        {/* Left flower */}
        <div className="absolute left-0 bottom-0 w-48 h-96 pointer-events-none select-none hidden lg:block">
          <FlowerLeft />
        </div>
        {/* Right flower */}
        <div className="absolute right-0 bottom-0 w-48 h-96 pointer-events-none select-none hidden lg:block">
          <FlowerRight />
        </div>

        {/* Center content */}
        <div className="text-center max-w-2xl relative z-10">
          {/* Corner sprigs on mobile */}
          <div className="flex justify-between mb-4 lg:hidden">
            <CornerSprig />
            <CornerSprig flip />
          </div>

          <h1 className="font-serif text-6xl md:text-8xl text-charcoal leading-[1.0] tracking-tight mb-6">
            Your story,<br />
            <em className="not-italic text-inkwell" style={{ fontStyle: 'italic' }}>on screen.</em>
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
      <div className="max-w-4xl mx-auto px-6">
        <GardenDivider />
      </div>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 py-20 relative">
        <div className="absolute top-8 right-0 hidden md:block"><CornerSprig flip /></div>
        <h2 className="font-serif text-4xl text-charcoal mb-2">How it works</h2>
        <p className="text-mutedgray mb-12">Five stages. Zero manual steps.</p>
        <div className="space-y-0">
          {PIPELINE.map((step, i) => (
            <div key={i} className="flex items-start gap-6 py-6 border-b border-border last:border-0">
              <div className="w-8 h-8 rounded-full bg-charcoal text-white flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                {i + 1}
              </div>
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
      <div className="max-w-4xl mx-auto px-6">
        <GardenDivider />
      </div>

      {/* API grid */}
      <section className="max-w-4xl mx-auto px-6 py-20 relative">
        <div className="absolute top-8 left-0 hidden md:block"><CornerSprig /></div>
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
      <div className="max-w-4xl mx-auto px-6">
        <GardenDivider />
      </div>

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

      {/* CTA with flowers */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="bg-charcoal rounded-3xl px-8 py-16 text-center relative overflow-hidden">
          {/* Decorative flower silhouettes inside dark card */}
          <div className="absolute left-4 bottom-0 w-32 h-48 opacity-10 pointer-events-none">
            <FlowerLeft />
          </div>
          <div className="absolute right-4 bottom-0 w-32 h-48 opacity-10 pointer-events-none">
            <FlowerRight />
          </div>
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
