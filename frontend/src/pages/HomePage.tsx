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

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  pending:    { color: 'text-gray-400',   label: 'Pending' },
  processing: { color: 'text-yellow-400', label: 'Generating' },
  completed:  { color: 'text-green-400',  label: 'Complete' },
  error:      { color: 'text-red-400',    label: 'Error' },
}

const VIDEO_MODELS = [
  { value: 'gen4_turbo',   label: 'Gen4 Turbo',   desc: '5 cr/s · Fast' },
  { value: 'gen4.5',       label: 'Gen4.5',        desc: '12 cr/s · Best' },
  { value: 'veo3.1_fast',  label: 'Veo3.1 Fast',  desc: '10 cr/s · Google' },
  { value: 'veo3.1',       label: 'Veo3.1',        desc: '20 cr/s · Premium' },
  { value: 'gen3a_turbo',  label: 'Gen3 Turbo',   desc: '3 cr/s · Budget' },
]

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round((value / 10) * 100)
  const color = value >= 7 ? 'bg-green-500' : value >= 5 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-gray-300">{value}/10</span>
      </div>
      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
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

  // Analysis state
  const [analysis, setAnalysis] = useState<StoryAnalysis | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const analyzeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Form state
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

  // Debounced story analysis
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
    e.preventDefault()
    setError('')
    setCreating(true)
    try {
      const { data } = await api.post('/api/projects', {
        title, story_text: story, video_model: videoModel, video_ratio: videoRatio,
        enable_narration: enableNarration, enable_sfx: enableSfx,
        enable_subtitles: enableSubtitles, enable_polish: enablePolish,
        polish_prompt: enablePolish ? polishPrompt : null,
        narrator_voice: narratorVoice,
      })
      navigate(`/project/${data.id}`)
    } catch (err) {
      setError(getApiError(err))
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d14] text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-[#11111c] border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold">I</div>
          <div>
            <span className="font-bold text-white">Inkframe</span>
            <span className="text-gray-500 text-xs ml-2">Story → Short Film</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {credits !== null && (
            <div className="flex items-center gap-1.5 bg-indigo-950/60 border border-indigo-800/50 rounded-full px-3 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span className="text-indigo-300 text-xs font-medium">{credits.toLocaleString()} credits</span>
            </div>
          )}
          <span className="text-gray-500 text-xs">{user?.email}</span>
          <button onClick={logout} className="text-xs text-gray-600 hover:text-gray-300 transition-colors">Sign out</button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Your Films</h2>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <span className="text-base leading-none">+</span> New Film
          </button>
        </div>

        {/* Project grid */}
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-600">
            <div className="text-5xl mb-4">🎬</div>
            <p className="text-lg text-gray-500 mb-1">No films yet</p>
            <p className="text-sm">Paste a story and Inkframe turns it into a short film</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {projects.map(p => {
              const s = STATUS_CONFIG[p.status] || { color: 'text-gray-400', label: p.status }
              return (
                <div
                  key={p.id}
                  onClick={() => navigate(`/project/${p.id}`)}
                  className="bg-[#16162a] border border-gray-800 hover:border-indigo-600/60 rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:shadow-indigo-900/30 group"
                >
                  {/* Thumbnail / placeholder */}
                  <div className="aspect-video bg-[#0d0d1a] flex items-center justify-center relative overflow-hidden">
                    <div className="text-4xl opacity-20 group-hover:opacity-30 transition-opacity">🎬</div>
                    <div className={`absolute top-2 right-2 text-xs font-medium ${s.color}`}>
                      {p.status === 'processing' && (
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse mr-1" />
                      )}
                      {s.label}
                    </div>
                  </div>
                  <div className="p-3 space-y-1">
                    <h3 className="text-sm font-semibold text-white truncate">{p.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{p.scene_count > 0 ? `${p.scene_count} scenes` : 'Not generated'}</span>
                      <span>·</span>
                      <span>{p.video_model}</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {new Date(p.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* New Film Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#13131f] border border-gray-800 rounded-2xl w-full max-w-2xl my-8 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h3 className="font-semibold text-lg">New Film Project</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white text-xl leading-none">×</button>
            </div>

            <form onSubmit={create} className="p-6 space-y-5">
              {/* Title */}
              <input
                className="w-full bg-[#1a1a2e] border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="Film title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />

              {/* Story + live analysis */}
              <div>
                <textarea
                  className="w-full bg-[#1a1a2e] border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors h-36 resize-none"
                  placeholder="Paste your story, novel excerpt, or creative brief... (min 80 chars for analysis)"
                  value={story}
                  onChange={e => setStory(e.target.value)}
                  required
                />

                {/* Story analysis panel — inspired by Novel-to-Script-Team emotion/insight agents */}
                {(analyzing || analysis) && (
                  <div className="mt-2 bg-[#0f0f1e] border border-gray-800 rounded-xl p-4">
                    {analyzing ? (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <svg className="animate-spin h-3 w-3 text-indigo-400" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Analyzing story quality...
                      </div>
                    ) : analysis && (
                      <>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Story Analysis</span>
                          <div className="flex items-center gap-2">
                            <div className={`text-2xl font-bold ${analysis.overall_score >= 70 ? 'text-green-400' : analysis.overall_score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                              {analysis.overall_score}
                            </div>
                            <span className="text-xs text-gray-500">/100</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${analysis.ready ? 'bg-green-900/50 text-green-400 border border-green-800' : 'bg-yellow-900/50 text-yellow-400 border border-yellow-800'}`}>
                              {analysis.ready ? '✓ Ready' : '⚠ Weak'}
                            </span>
                          </div>
                        </div>

                        {analysis.emotional_arc && (
                          <div className="mb-3 text-xs text-indigo-300 bg-indigo-950/40 border border-indigo-900/50 rounded-lg px-3 py-2">
                            <span className="text-indigo-500 font-semibold">Emotional arc: </span>{analysis.emotional_arc}
                          </div>
                        )}

                        <div className="space-y-2 mb-3">
                          <ScoreBar label="Hook strength" value={analysis.hook_score} />
                          <ScoreBar label="Visual richness" value={analysis.visual_richness} />
                          <ScoreBar label="Suspense & stakes" value={analysis.suspense_score} />
                        </div>

                        {analysis.tip && (
                          <div className="text-xs text-amber-300 bg-amber-950/30 border border-amber-800/50 rounded-lg px-3 py-2">
                            <span className="font-semibold">💡 Tip: </span>{analysis.tip}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Model selector */}
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Video Model</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {VIDEO_MODELS.map(m => (
                    <button key={m.value} type="button"
                      onClick={() => setVideoModel(m.value)}
                      className={`p-2.5 rounded-lg border text-left transition-colors ${videoModel === m.value ? 'border-indigo-500 bg-indigo-900/30' : 'border-gray-700 hover:border-gray-600 bg-[#1a1a2e]'}`}>
                      <div className="text-xs font-medium text-white">{m.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect ratio */}
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Aspect Ratio</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: '1280:720', label: '16:9 Landscape', sub: 'YouTube, web' },
                    { value: '1080:1920', label: '9:16 Vertical', sub: 'TikTok, Reels' },
                  ].map(r => (
                    <button key={r.value} type="button"
                      onClick={() => setVideoRatio(r.value)}
                      className={`p-2.5 rounded-lg border text-left transition-colors ${videoRatio === r.value ? 'border-indigo-500 bg-indigo-900/30' : 'border-gray-700 hover:border-gray-600 bg-[#1a1a2e]'}`}>
                      <div className="text-xs font-medium text-white">{r.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{r.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Audio & features */}
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Narrator Voice</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Rachel',  label: 'Rachel',  desc: 'Warm · Female' },
                    { id: 'Adam',    label: 'Adam',    desc: 'Deep · Male' },
                    { id: 'Bella',   label: 'Bella',   desc: 'Soft · Female' },
                    { id: 'Antoni',  label: 'Antoni',  desc: 'Crisp · Male' },
                    { id: 'Elli',    label: 'Elli',    desc: 'Young · Female' },
                    { id: 'Josh',    label: 'Josh',    desc: 'Casual · Male' },
                  ].map(v => (
                    <button key={v.id} type="button"
                      onClick={() => setNarratorVoice(v.id)}
                      className={`p-2 rounded-lg border text-left transition-colors ${narratorVoice === v.id ? 'border-blue-500 bg-blue-900/30' : 'border-gray-700 hover:border-gray-600 bg-[#1a1a2e]'}`}>
                      <div className="text-xs font-medium text-white">{v.label}</div>
                      <div className="text-xs text-gray-500">{v.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Features</label>
                <div className="bg-[#1a1a2e] border border-gray-700 rounded-lg divide-y divide-gray-800">
                  {[
                    { key: 'narration', state: enableNarration, set: setEnableNarration, icon: '🎙', label: 'Narration voiceover', sub: 'ElevenLabs TTS per scene' },
                    { key: 'sfx',       state: enableSfx,       set: setEnableSfx,       icon: '🔊', label: 'Sound effects',       sub: 'Ambient SFX per scene' },
                    { key: 'subtitles', state: enableSubtitles, set: setEnableSubtitles, icon: '📝', label: 'Subtitles',            sub: 'Burned into video' },
                  ].map(f => (
                    <label key={f.key} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors">
                      <input type="checkbox" checked={f.state} onChange={e => f.set(e.target.checked)} className="w-4 h-4 accent-indigo-500 flex-shrink-0" />
                      <span className="text-base">{f.icon}</span>
                      <div className="flex-1">
                        <span className="text-sm text-white">{f.label}</span>
                        <span className="text-xs text-gray-500 ml-2">{f.sub}</span>
                      </div>
                    </label>
                  ))}
                  <label className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors">
                    <input type="checkbox" checked={enablePolish} onChange={e => setEnablePolish(e.target.checked)} className="w-4 h-4 accent-purple-500 flex-shrink-0" />
                    <span className="text-base">✨</span>
                    <div className="flex-1">
                      <span className="text-sm text-white">Cinematic polish</span>
                      <span className="text-xs text-gray-500 ml-2">gen4_aleph video-to-video</span>
                    </div>
                  </label>
                  {enablePolish && (
                    <div className="px-4 py-3 bg-purple-950/20">
                      <input
                        className="w-full bg-[#1a1a2e] border border-gray-700 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                        placeholder="Polish style (e.g. 'film grain, warm tones')"
                        value={polishPrompt}
                        onChange={e => setPolishPrompt(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <div className="flex gap-3 pt-1">
                <button type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-lg border border-gray-700 text-sm text-gray-300 hover:bg-gray-800 transition-colors">
                  Cancel
                </button>
                <button
                  className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={creating}>
                  {creating ? 'Creating...' : 'Create Film'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
