import { Link } from 'react-router-dom'

const PIPELINE = [
  { icon: '✦', label: 'Show-Don\'t-Tell rewrite', desc: 'Emotion words become visual actions' },
  { icon: '◈', label: 'Storyboard generation', desc: 'gen4_image_turbo frames in seconds' },
  { icon: '▶', label: 'Scene animation', desc: '5 video models, parallel rendering' },
  { icon: '♪', label: 'Narration & SFX', desc: 'TTS + ambient sound per scene' },
  { icon: '✦', label: 'Assembly', desc: 'Subtitles, polish, final MP4' },
]

const APIS = [
  'gen4_image_turbo', 'gen4.5 text-to-video', 'gen4_turbo', 'veo3.1',
  'eleven_multilingual_v2', 'eleven_text_to_sound_v2', 'eleven_voice_isolation',
  'eleven_multilingual_sts_v2', 'gen4_aleph', 'eleven_voice_dubbing',
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-vellum font-sans">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-vellum/95 backdrop-blur border-b border-border px-6 py-3 flex items-center justify-between">
        <span className="font-serif text-xl text-charcoal tracking-tight">Inkframe</span>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm text-inkwell hover:text-charcoal transition-colors">Sign in</Link>
          <Link to="/register" className="btn-primary text-sm">Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white border border-border rounded-full px-4 py-1.5 text-xs text-mutedgray mb-10">
          <span className="w-1.5 h-1.5 rounded-full bg-storygreen inline-block" />
          Built for the Runway API Hackathon · May 2026
        </div>

        {/* Headline */}
        <h1 className="font-serif text-5xl md:text-7xl text-charcoal leading-[1.05] tracking-tight mb-6">
          Your story,<br />
          <span className="italic text-inkwell">on screen.</span>
        </h1>

        <p className="text-lg text-mutedgray max-w-xl mx-auto leading-relaxed mb-10">
          Paste any story. Inkframe chains 10 Runway APIs to produce a narrated, scored, subtitled short film — in 90 seconds.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link to="/register" className="btn-primary px-8 py-3 text-base">Start writing →</Link>
          <Link to="/login" className="btn-secondary px-8 py-3 text-base">Sign in</Link>
        </div>

        {/* Social proof strip */}
        <p className="mt-10 text-xs text-mutedgray">
          10 Runway APIs · 8-stage pipeline · 29-language dubbing · No video editing required
        </p>
      </section>

      {/* Divider */}
      <div className="divider max-w-4xl mx-auto" />

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="font-serif text-3xl text-charcoal mb-2">How it works</h2>
        <p className="text-mutedgray mb-12">Five stages. Zero manual steps.</p>

        <div className="space-y-0">
          {PIPELINE.map((step, i) => (
            <div key={i} className="flex items-start gap-6 py-6 border-b border-border last:border-0">
              <div className="w-8 h-8 rounded-full bg-charcoal text-white flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-storygreen text-sm">{step.icon}</span>
                  <span className="font-medium text-charcoal text-sm">{step.label}</span>
                </div>
                <p className="text-sm text-mutedgray">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="divider max-w-4xl mx-auto" />

      {/* API grid */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="font-serif text-3xl text-charcoal mb-2">10 Runway APIs</h2>
        <p className="text-mutedgray mb-10">Not a single call — a full agentic pipeline.</p>
        <div className="flex flex-wrap gap-2">
          {APIS.map(api => (
            <span key={api} className="bg-white border border-border text-bookgray text-xs px-3 py-1.5 rounded-full font-mono">
              {api}
            </span>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="divider max-w-4xl mx-auto" />

      {/* Features 3-col */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="font-serif text-3xl text-charcoal mb-12">Everything included</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Story intelligence', body: 'Show-don\'t-tell rewrite, continuity extraction, and live quality scoring before a single frame is generated.' },
            { title: 'Voice & audio', body: '6 narrator voices, ambient SFX per scene, voice isolation, and speech-to-speech style conversion.' },
            { title: 'Global reach', body: 'One-click dubbing into 29 languages. Your film, everywhere.' },
            { title: 'Visual control', body: 'Upload style and character references. Every scene stays consistent.' },
            { title: 'Real-time progress', body: 'Watch each stage complete live — frames appearing, clips animating, audio mixing.' },
            { title: 'AI Director', body: 'Talk to a Runway Characters avatar that knows your story and can suggest scene changes.' },
          ].map(f => (
            <div key={f.title} className="card p-6">
              <h3 className="font-serif text-lg text-charcoal mb-2">{f.title}</h3>
              <p className="text-sm text-mutedgray leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="bg-charcoal rounded-2xl px-8 py-16">
          <h2 className="font-serif text-4xl text-white mb-4">Ready to make your film?</h2>
          <p className="text-[#9e9a91] mb-8 max-w-md mx-auto">Paste a story. Get a short film. No production team required.</p>
          <Link to="/register" className="inline-block bg-white text-charcoal font-medium px-8 py-3 rounded-full text-sm hover:bg-vellum transition-colors">
            Start for free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="divider">
        <div className="max-w-4xl mx-auto px-6 py-8 flex items-center justify-between text-xs text-mutedgray">
          <span className="font-serif text-sm text-charcoal">Inkframe</span>
          <span>Runway API Hackathon · May 2026 · Tasfia Chowdhury</span>
        </div>
      </footer>
    </div>
  )
}
