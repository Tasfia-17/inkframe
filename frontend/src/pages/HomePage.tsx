import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { getApiError } from '../utils/api'
import { useAuth } from '../contexts/AuthContext'

interface Project { id: number; title: string; status: string; scene_count: number; created_at: string; video_model: string }

const STATUS_COLOR: Record<string, string> = {
  pending: 'text-gray-400', processing: 'text-yellow-400',
  completed: 'text-green-400', error: 'text-red-400',
}

const VIDEO_MODELS = [
  { value: 'gen4_turbo', label: 'Gen4 Turbo', desc: 'Fast & cheap (5 cr/s)' },
  { value: 'gen4.5', label: 'Gen4.5', desc: 'Best quality (12 cr/s)' },
  { value: 'veo3.1_fast', label: 'Veo3.1 Fast', desc: 'Google model (10 cr/s)' },
  { value: 'veo3.1', label: 'Veo3.1', desc: 'Google premium (20 cr/s)' },
  { value: 'gen3a_turbo', label: 'Gen3 Turbo', desc: 'Legacy / budget (3 cr/s)' },
]

export default function HomePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [showForm, setShowForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

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
  const [credits, setCredits] = useState<number | null>(null)

  useEffect(() => { 
    api.get('/api/projects').then(({ data }) => setProjects(data))
    api.get('/api/projects/usage').then(({ data }) => setCredits(data.credits_remaining)).catch(() => {})
  }, [])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setCreating(true)
    try {
      const { data } = await api.post('/api/projects', {
        title, story_text: story,
        video_model: videoModel,
        video_ratio: videoRatio,
        enable_narration: enableNarration,
        enable_sfx: enableSfx,
        enable_subtitles: enableSubtitles,
        enable_polish: enablePolish,
        polish_prompt: enablePolish ? polishPrompt : null,
      })
      navigate(`/project/${data.id}`)
    } catch (err) {
      setError(getApiError(err))
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Inkframe</h1>
          <p className="text-xs text-gray-500">Story → Short Film</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{user?.email}</span>
          {credits !== null && <span className="text-indigo-400 text-sm font-medium">{credits.toLocaleString()} credits</span>}
          <button onClick={logout} className="text-gray-500 hover:text-white text-sm">Sign out</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold">Your Films</h2>
          <button className="btn-primary" onClick={() => setShowForm(true)}>+ New Film</button>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-gray-900 rounded-xl p-6 w-full max-w-xl my-4">
              <h3 className="text-lg font-semibold mb-4">New Film Project</h3>
              <form onSubmit={create} className="space-y-4">
                <input className="input" placeholder="Film title" value={title} onChange={e => setTitle(e.target.value)} required />
                <textarea className="input h-32 resize-none" placeholder="Paste your story, novel excerpt, or creative brief..." value={story} onChange={e => setStory(e.target.value)} required />

                {/* Feature 4: Model selector */}
                <div>
                  <label className="text-xs text-gray-400 block mb-2">Video Model</label>
                  <div className="grid grid-cols-2 gap-2">
                    {VIDEO_MODELS.map(m => (
                      <button key={m.value} type="button"
                        onClick={() => setVideoModel(m.value)}
                        className={`p-2 rounded-lg border text-left transition-colors ${videoModel === m.value ? 'border-indigo-500 bg-indigo-900/30' : 'border-gray-700 hover:border-gray-600'}`}>
                        <div className="text-xs font-medium">{m.label}</div>
                        <div className="text-xs text-gray-500">{m.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aspect ratio selector */}
                <div>
                  <label className="text-xs text-gray-400 block mb-2">Aspect Ratio</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button"
                      onClick={() => setVideoRatio('1280:720')}
                      className={`p-2 rounded-lg border text-left transition-colors ${videoRatio === '1280:720' ? 'border-indigo-500 bg-indigo-900/30' : 'border-gray-700 hover:border-gray-600'}`}>
                      <div className="text-xs font-medium">16:9 Landscape</div>
                      <div className="text-xs text-gray-500">YouTube, web</div>
                    </button>
                    <button type="button"
                      onClick={() => setVideoRatio('1080:1920')}
                      className={`p-2 rounded-lg border text-left transition-colors ${videoRatio === '1080:1920' ? 'border-indigo-500 bg-indigo-900/30' : 'border-gray-700 hover:border-gray-600'}`}>
                      <div className="text-xs font-medium">9:16 Vertical</div>
                      <div className="text-xs text-gray-500">TikTok, Reels</div>
                    </button>
                  </div>
                </div>

                {/* Features 1 & 2: Audio toggles */}
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 block">Audio & Subtitles</label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={enableNarration} onChange={e => setEnableNarration(e.target.checked)} className="w-4 h-4 accent-indigo-500" />
                    <div>
                      <span className="text-sm">🎙 Narration voiceover</span>
                      <span className="text-xs text-gray-500 ml-2">ElevenLabs TTS per scene</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={enableSfx} onChange={e => setEnableSfx(e.target.checked)} className="w-4 h-4 accent-indigo-500" />
                    <div>
                      <span className="text-sm">🔊 Sound effects</span>
                      <span className="text-xs text-gray-500 ml-2">Ambient SFX per scene</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={enableSubtitles} onChange={e => setEnableSubtitles(e.target.checked)} className="w-4 h-4 accent-indigo-500" />
                    <div>
                      <span className="text-sm">📝 Subtitles</span>
                      <span className="text-xs text-gray-500 ml-2">Burn narration text into video</span>
                    </div>
                  </label>
                </div>

                {/* Feature 7: Polish toggle */}
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={enablePolish} onChange={e => setEnablePolish(e.target.checked)} className="w-4 h-4 accent-purple-500" />
                    <div>
                      <span className="text-sm">✨ Cinematic polish pass</span>
                      <span className="text-xs text-gray-500 ml-2">gen4_aleph video-to-video</span>
                    </div>
                  </label>
                  {enablePolish && (
                    <input className="input text-xs" placeholder="Polish style (e.g. 'film grain, warm tones')"
                      value={polishPrompt} onChange={e => setPolishPrompt(e.target.value)} />
                  )}
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}
                <div className="flex gap-3 pt-2">
                  <button type="button" className="btn-secondary flex-1" onClick={() => setShowForm(false)}>Cancel</button>
                  <button className="btn-primary flex-1" disabled={creating}>{creating ? 'Creating...' : 'Create Film'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {projects.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-4xl mb-4">🎬</p>
            <p className="text-lg mb-2">No films yet</p>
            <p className="text-sm">Paste a story and Inkframe turns it into a short film</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {projects.map(p => (
              <div key={p.id} className="bg-gray-900 rounded-xl p-5 cursor-pointer hover:bg-gray-800 transition-colors"
                onClick={() => navigate(`/project/${p.id}`)}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{p.title}</h3>
                  <span className={`text-sm capitalize ${STATUS_COLOR[p.status] || 'text-gray-400'}`}>{p.status}</span>
                </div>
                <p className="text-gray-500 text-sm mt-1">
                  {p.scene_count > 0 ? `${p.scene_count} scenes` : 'Not generated'} · {p.video_model} · {new Date(p.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
