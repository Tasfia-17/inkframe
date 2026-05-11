import { Link } from 'react-router-dom'
import { BotanicalLeft, BotanicalRight, GardenDivider, CornerSprig } from '../components/Botanicals'

const PIPELINE = [
  { label: "Show Don't Tell rewrite", desc: 'Emotion words become visual actions a camera can capture' },
  { label: 'Storyboard generation',   desc: 'gen4_image_turbo frames with style and character references' },
  { label: 'Scene animation',         desc: '5 video models, all scenes rendered in parallel' },
  { label: 'Narration and SFX',       desc: 'TTS voiceover plus ambient sound effects per scene' },
  { label: 'Assembly and export',     desc: 'Subtitles, cinematic polish, final MP4 in 90 seconds' },
]

const APIS = [
  'gen4_image_turbo', 'gen4.5 text-to-video', 'gen4_turbo', 'veo3.1',
  'eleven_multilingual_v2', 'eleven_text_to_sound_v2', 'eleven_voice_isolation',
  'eleven_multilingual_sts_v2', 'gen4_aleph', 'eleven_voice_dubbing',
]

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
        <div className="absolute left-0 bottom-0 w-56 h-[520px] pointer-events-none select-none hidden lg:block">
          <BotanicalLeft />
        </div>
        <div className="absolute right-0 bottom-0 w-56 h-[520px] pointer-events-none select-none hidden lg:block">
          <BotanicalRight />
        </div>

        <div className="text-center max-w-2xl relative z-10">
          <div className="flex justify-between mb-2 lg:hidden px-2">
            <CornerSprig />
            <CornerSprig flip />
          </div>

          <h1 className="font-serif text-6xl md:text-8xl text-charcoal leading-[1.0] tracking-tight mb-6">
            Your story,<br />
            <span className="italic">on screen.</span>
          </h1>

          <p className="text-lg text-mutedgray max-w-lg mx-auto leading-relaxed mb-10">
            Paste any story. Inkframe chains 10 Runway APIs to produce a narrated, scored, subtitled short film in 90 seconds.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap mb-12">
            <Link to="/register" className="btn-primary px-8 py-3 text-base">Start writing</Link>
            <Link to="/login" className="btn-secondary px-8 py-3 text-base">Sign in</Link>
          </div>

          <p className="text-xs text-mutedgray">
            10 Runway APIs · 8-stage pipeline · 29-language dubbing · No video editing required
          </p>
        </div>
      </section>

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

      <div className="max-w-4xl mx-auto px-6"><GardenDivider /></div>

      {/* API grid */}
      <section className="max-w-4xl mx-auto px-6 py-20 relative">
        <div className="absolute top-6 left-0 hidden md:block"><CornerSprig /></div>
        <h2 className="font-serif text-4xl text-charcoal mb-2">10 Runway APIs</h2>
        <p className="text-mutedgray mb-10">Not a single call. A full agentic pipeline.</p>
        <div className="flex flex-wrap gap-2">
          {APIS.map(api => (
            <span key={api} className="bg-white border border-border text-bookgray text-xs px-3 py-1.5 rounded-full font-mono hover:border-storygreen hover:text-storygreen transition-colors cursor-default">
              {api}
            </span>
          ))}
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6"><GardenDivider /></div>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="font-serif text-4xl text-charcoal mb-12">Everything included</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '✦', title: 'Story intelligence', body: "Show don't tell rewrite, continuity extraction, and live quality scoring before a single frame is generated." },
            { icon: '♪', title: 'Voice and audio',    body: '6 narrator voices, ambient SFX per scene, voice isolation, and speech-to-speech style conversion.' },
            { icon: '◈', title: 'Global reach',        body: 'One-click dubbing into 29 languages. Your film, everywhere.' },
            { icon: '▶', title: 'Visual control',      body: 'Upload style and character references. Every scene stays consistent.' },
            { icon: '✦', title: 'Real-time progress',  body: 'Watch each stage complete live. Frames appearing, clips animating, audio mixing.' },
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
          <div className="absolute left-4 bottom-0 w-40 h-56 opacity-[0.08] pointer-events-none"><BotanicalLeft /></div>
          <div className="absolute right-4 bottom-0 w-40 h-56 opacity-[0.08] pointer-events-none"><BotanicalRight /></div>
          <div className="relative z-10">
            <h2 className="font-serif text-4xl text-white mb-4">Ready to make your film?</h2>
            <p className="text-[#9e9a91] mb-8 max-w-md mx-auto">Paste a story. Get a short film. No production team required.</p>
            <Link to="/register" className="inline-block bg-white text-charcoal font-medium px-8 py-3 rounded-full text-sm hover:bg-vellum transition-colors">
              Start for free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-4xl mx-auto px-6 py-8 flex items-center justify-between text-xs text-mutedgray">
          <span className="font-serif text-sm text-charcoal">Inkframe</span>
          <span>2026 Tasfia Chowdhury</span>
        </div>
      </footer>
    </div>
  )
}
