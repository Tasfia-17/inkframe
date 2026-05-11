import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { getApiError } from '../utils/api'
import { useAuth } from '../contexts/AuthContext'

interface Project {
  id: number; title: string; status: string; scene_count: number
  created_at: string; video_model: string; final_video_path: string | null
}
interface StoryAnalysis {
  hook_score: number; emotional_arc: string; visual_richness: number
  suspense_score: number; overall_score: number; tip: string; ready: boolean
}

const STATUS_CONFIG: Record<string, { dot: string; label: string }> = {
  pending:    { dot: 'bg-[#d4cfc4]',   label: 'Pending' },
  processing: { dot: 'bg-amber-400 animate-pulse', label: 'Generating' },
  completed:  { dot: 'bg-storygreen',  label: 'Complete' },
  error:      { dot: 'bg-red-400',     label: 'Error' },
}

const VIDEO_MODELS = [
  { value: 'gen4_turbo',  label: 'Gen4 Turbo',  desc: '5 cr/s · Fast' },
  { value: 'gen4.5',      label: 'Gen4.5',       desc: '12 cr/s · Best' },
  { value: 'veo3.1_fast', label: 'Veo3.1 Fast', desc: '10 cr/s · Google' },
  { value: 'veo3.1',      label: 'Veo3.1',       desc: '20 cr/s · Premium' },
  { value: 'gen3a_turbo', label: 'Gen3 Turbo',  desc: '3 cr/s · Budget' },
]

const VOICES = [
  { id: 'Rachel', label: 'Rachel', desc: 'Warm · F' },
  { id: 'Adam',   label: 'Adam',   desc: 'Deep · M' },
  { id: 'Bella',  label: 'Bella',  desc: 'Soft · F' },
  { id: 'Antoni', label: 'Antoni', desc: 'Crisp · M' },
  { id: 'Elli',   label: 'Elli',   desc: 'Young · F' },
  { id: 'Josh',   label: 'Josh',   desc: 'Casual · M' },
]

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round((value / 10) * 100)
  const color = value >= 7 ? 'bg-storygreen' : value >= 5 ? 'bg-amber-400' : 'bg-red-400'
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-mutedgray">{label}</span>
        <span className="text-bookgray font-medium">{value}/10</span>
      </div>
      <div className="h-1 bg-border rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function OptionBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={`p-2.5 rounded-lg border text-left transition-colors text-sm ${active ? 'border-charcoal bg-charcoal text-white' : 'border-border hover:border-borderdark bg-white text-inkwell'}`}>
      {children}
    </button>
  )
}

export default function HomePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [credits, setCredits] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const [analysis, setAnalysis] = useState<StoryAnalysis | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const analyzeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [title, setTitle] = useState('')
  const [story, setStory] = useState('')
  const [videoModel, setVideoModel] = useState('gen4_turbo')
  const [videoRatio, setVideoRatio] = useState('1280:720')
  const [enableNarration, setEnableNarration] = useState(true)
  const [enableSfx, setEnableSfx] = useState(true)
  const [enableSubtitles, setEnableSubtitles] = useState(true)
  const [enablePolish, setEnablePolish] = useState(false)
  const [polishPrompt, setPolishPrompt] = useState('cinematic film grain, enhance colors, dramatic lighting')
  const [narratorVoice, setNarratorVoice] = useState('Rachel')

  useEffect(() => {
    api.get('/api/projects').then(({ data }) => setProjects(data))
    api.get('/api/projects/usage').then(({ data }) => setCredits(data.credits_remaining)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!story || story.length < 80) { setAnalysis(null); return }
    if (analyzeTimer.current) clearTimeout(analyzeTimer.current)
    analyzeTimer.current = setTimeout(async () => {
      setAnalyzing(true)
      try {
        const { data } = await api.post('/api/projects/analyze-story', { story_text: story })
        setAnalysis(data)
      } catch { /* silent */ }
      finally { setAnalyzing(false) }
    }, 1200)
    return () => { if (analyzeTimer.current) clearTimeout(analyzeTimer.current) }
  }, [story])

  const create = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setCreating(true)
    try {
      const { data } = await api.post('/api/projects', {
        title, story_text: story, video_model: videoModel, video_ratio: videoRatio,
        enable_narration: enableNarration, enable_sfx: enableSfx,
        enable_subtitles: enableSubtitles, enable_polish: enablePolish,
        polish_prompt: enablePolish ? polishPrompt : null,
        narrator_voice: narratorVoice,
      })
      navigate(`/project/${data.id}`)
    } catch (err) { setError(getApiError(err)); setCreating(false) }
  }

  return (
    <div className="min-h-screen bg-vellum font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-vellum/95 backdrop-blur border-b border-border px-6 py-3 flex items-center justify-between">
        <span className="font-serif text-xl text-charcoal">Inkframe</span>
        <div className="flex items-center gap-4">
          {credits !== null && (
            <span className="text-xs text-mutedgray border border-border rounded-full px-3 py-1">
              {credits.toLocaleString()} credits
            </span>
          )}
          <span className="text-xs text-mutedgray hidden sm:block">{user?.email}</span>
          <button onClick={logout} className="text-xs text-mutedgray hover:text-charcoal transition-colors">Sign out</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-serif text-3xl text-charcoal">Your films</h2>
            <p className="text-mutedgray text-sm mt-1">Each story becomes a short film</p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary">+ New film</button>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-borderdark rounded-2xl">
            <p className="font-serif text-2xl text-charcoal mb-2">No films yet</p>
            <p className="text-mutedgray text-sm mb-6">Paste a story and Inkframe turns it into a short film</p>
            <button onClick={() => setShowForm(true)} className="btn-primary">Write your first story</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(p => {
              const s = STATUS_CONFIG[p.status] || { dot: 'bg-[#d4cfc4]', label: p.status }
              return (
                <div key={p.id} onClick={() => navigate(`/project/${p.id}`)}
                  className="card p-5 cursor-pointer hover:shadow-md hover:border-borderdark transition-all group">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-serif text-lg text-charcoal leading-tight group-hover:text-inkwell">{p.title}</h3>
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      <span className="text-xs text-mutedgray">{s.label}</span>
                    </div>
                  </div>
                  <p className="text-xs text-mutedgray">
                    {p.scene_count > 0 ? `${p.scene_count} scenes` : 'Not generated'} · {p.video_model}
                  </p>
                  <p className="text-xs text-[#c4bfb5] mt-1">
                    {new Date(p.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* New Film Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-vellum border border-border rounded-2xl w-full max-w-xl my-8 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="font-serif text-xl text-charcoal">New film project</h3>
              <button onClick={() => setShowForm(false)} className="text-mutedgray hover:text-charcoal text-2xl leading-none">×</button>
            </div>

            <form onSubmit={create} className="p-6 space-y-5">
              <input className="input" placeholder="Film title" value={title} onChange={e => setTitle(e.target.value)} required />

              {/* Story + live analysis */}
              <div>
                <textarea
                  className="input h-36 resize-none"
                  placeholder="Paste your story, novel excerpt, or creative brief…"
                  value={story} onChange={e => setStory(e.target.value)} required
                />
                {(analyzing || analysis) && (
                  <div className="mt-2 bg-white border border-border rounded-xl p-4">
                    {analyzing ? (
                      <div className="flex items-center gap-2 text-xs text-mutedgray">
                        <div className="w-3 h-3 border border-charcoal border-t-transparent rounded-full animate-spin" />
                        Analyzing story quality…
                      </div>
                    ) : analysis && (
                      <>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-medium text-mutedgray uppercase tracking-wider">Story score</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-2xl font-serif font-medium ${analysis.overall_score >= 70 ? 'text-storygreen' : analysis.overall_score >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                              {analysis.overall_score}
                            </span>
                            <span className="text-xs text-mutedgray">/100</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${analysis.ready ? 'border-storygreen text-storygreen' : 'border-amber-400 text-amber-600'}`}>
                              {analysis.ready ? '✓ Ready' : '⚠ Weak'}
                            </span>
                          </div>
                        </div>
                        {analysis.emotional_arc && (
                          <p className="text-xs text-mutedgray mb-3 italic">"{analysis.emotional_arc}"</p>
                        )}
                        <div className="space-y-2 mb-3">
                          <ScoreBar label="Hook strength" value={analysis.hook_score} />
                          <ScoreBar label="Visual richness" value={analysis.visual_richness} />
                          <ScoreBar label="Suspense & stakes" value={analysis.suspense_score} />
                        </div>
                        {analysis.tip && (
                          <p className="text-xs text-bookgray bg-vellum rounded-lg px-3 py-2">
                            <span className="font-medium">Tip: </span>{analysis.tip}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Video model */}
              <div>
                <label className="text-xs text-mutedgray uppercase tracking-wider block mb-2">Video model</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {VIDEO_MODELS.map(m => (
                    <OptionBtn key={m.value} active={videoModel === m.value} onClick={() => setVideoModel(m.value)}>
                      <div className="font-medium text-xs">{m.label}</div>
                      <div className="text-xs opacity-60 mt-0.5">{m.desc}</div>
                    </OptionBtn>
                  ))}
                </div>
              </div>

              {/* Aspect ratio */}
              <div>
                <label className="text-xs text-mutedgray uppercase tracking-wider block mb-2">Aspect ratio</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: '1280:720',  label: '16:9 Landscape', sub: 'YouTube, web' },
                    { value: '1080:1920', label: '9:16 Vertical',  sub: 'TikTok, Reels' },
                  ].map(r => (
                    <OptionBtn key={r.value} active={videoRatio === r.value} onClick={() => setVideoRatio(r.value)}>
                      <div className="font-medium text-xs">{r.label}</div>
                      <div className="text-xs opacity-60 mt-0.5">{r.sub}</div>
                    </OptionBtn>
                  ))}
                </div>
              </div>

              {/* Narrator voice */}
              <div>
                <label className="text-xs text-mutedgray uppercase tracking-wider block mb-2">Narrator voice</label>
                <div className="grid grid-cols-3 gap-2">
                  {VOICES.map(v => (
                    <OptionBtn key={v.id} active={narratorVoice === v.id} onClick={() => setNarratorVoice(v.id)}>
                      <div className="font-medium text-xs">{v.label}</div>
                      <div className="text-xs opacity-60 mt-0.5">{v.desc}</div>
                    </OptionBtn>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="text-xs text-mutedgray uppercase tracking-wider block mb-2">Features</label>
                <div className="bg-white border border-border rounded-xl divide-y divide-border">
                  {[
                    { key: 'narration', state: enableNarration, set: setEnableNarration, icon: '🎙', label: 'Narration voiceover', sub: 'ElevenLabs TTS per scene' },
                    { key: 'sfx',       state: enableSfx,       set: setEnableSfx,       icon: '🔊', label: 'Sound effects',       sub: 'Ambient SFX per scene' },
                    { key: 'subtitles', state: enableSubtitles, set: setEnableSubtitles, icon: '📝', label: 'Subtitles',            sub: 'Burned into video' },
                    { key: 'polish',    state: enablePolish,    set: setEnablePolish,    icon: '✨', label: 'Cinematic polish',     sub: 'gen4_aleph pass' },
                  ].map(f => (
                    <label key={f.key} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-vellum transition-colors">
                      <input type="checkbox" checked={f.state} onChange={e => f.set(e.target.checked)} className="w-4 h-4 accent-charcoal flex-shrink-0" />
                      <span className="text-base">{f.icon}</span>
                      <div className="flex-1">
                        <span className="text-sm text-inkwell">{f.label}</span>
                        <span className="text-xs text-mutedgray ml-2">{f.sub}</span>
                      </div>
                    </label>
                  ))}
                  {enablePolish && (
                    <div className="px-4 py-3">
                      <input className="input text-xs" placeholder="Polish style prompt"
                        value={polishPrompt} onChange={e => setPolishPrompt(e.target.value)} />
                    </div>
                  )}
                </div>
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1 py-2.5">Cancel</button>
                <button className="btn-primary flex-1 py-2.5" disabled={creating}>
                  {creating ? 'Creating…' : 'Create film'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
