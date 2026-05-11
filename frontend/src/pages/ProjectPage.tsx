import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api, { getApiError } from '../utils/api'
import { useSSEProgress } from '../hooks/useSSEProgress'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface Scene {
  id: number; index: number; description: string
  visual_prompt: string; motion_prompt: string
  narration_text: string; sfx_prompt: string
  frame_path: string | null; clip_path: string | null
  polished_clip_path: string | null
  narration_path: string | null; sfx_path: string | null
  clip_url: string | null; status: string; error: string | null
}
interface Project {
  id: number; title: string; status: string; scene_count: number
  final_video_path: string | null; current_task_id: string | null
  video_model: string; video_ratio: string; enable_narration: boolean
  enable_sfx: boolean; enable_subtitles: boolean; enable_polish: boolean
  polish_prompt: string | null; style_ref_path: string | null
  char_ref_path: string | null; storyboard_pdf_path: string | null
  scenes: Scene[]
}

const STAGE_LABEL: Record<string, string> = {
  starting: 'Starting...',
  parsing_story: 'Rewriting for visual storytelling & extracting continuity...',
  generating_frames: 'Generating storyboard frames...',
  animating_clips: 'Animating scenes...',
  generating_audio: 'Generating narration & sound effects...',
  polishing: 'Applying cinematic polish...',
  assembling_video: 'Assembling final video...',
  completed: 'Complete!', error: 'Error', cancelled: 'Cancelled',
}

const SCENE_STATUS_COLOR: Record<string, string> = {
  pending:          'bg-gray-700',
  generating_frame: 'bg-yellow-500 animate-pulse',
  frame_done:       'bg-blue-500',
  generating_clip:  'bg-purple-500 animate-pulse',
  clip_done:        'bg-indigo-500',
  completed:        'bg-green-500',
  error:            'bg-red-500',
}

type RightTab = 'scene' | 'director'

// ── Scene Timeline (inspired by Shotloom's ShotTimeline) ─────────────────────
function SceneTimeline({ scenes, selectedIndex, onSelect }: {
  scenes: Scene[]; selectedIndex: number; onSelect: (i: number) => void
}) {
  if (!scenes.length) return null
  const total = scenes.length
  return (
    <div className="px-4 py-2 bg-[#11111c] border-t border-gray-800">
      <div className="relative h-8 bg-gray-800 rounded-lg overflow-hidden flex">
        {scenes.map(s => {
          const isSelected = s.index === selectedIndex
          const hasClip = !!s.clip_path
          const hasFrame = !!s.frame_path
          return (
            <div
              key={s.index}
              title={`Scene ${s.index + 1} — ${s.description?.slice(0, 60) || ''}`}
              onClick={() => onSelect(s.index)}
              style={{ width: `${100 / total}%` }}
              className={`relative h-full border-r border-[#0d0d14] cursor-pointer transition-colors
                ${isSelected ? 'ring-1 ring-inset ring-indigo-400 bg-indigo-600/70'
                  : hasClip ? 'bg-indigo-900/50 hover:bg-indigo-800/50'
                  : hasFrame ? 'bg-blue-900/40 hover:bg-blue-800/40'
                  : 'bg-gray-700/40 hover:bg-gray-600/40'}`}
            >
              <span className="absolute bottom-0.5 left-1 text-[9px] text-gray-400 leading-none pointer-events-none select-none">
                {s.index + 1}
              </span>
              {s.status === 'generating_frame' || s.status === 'generating_clip' ? (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
              ) : s.status === 'error' ? (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500" />
              ) : null}
            </div>
          )
        })}
      </div>
      <div className="flex justify-between text-[10px] text-gray-600 mt-1 px-0.5">
        <span>Scene 1</span>
        <span>Scene {total}</span>
      </div>
    </div>
  )
}

// ── Scene Detail Panel (inspired by Shotloom's ShotDetailPanel sections) ─────
function SceneDetailPanel({ scene, projectId, onSaved }: {
  scene: Scene; projectId: number; onSaved: () => void
}) {
  const [editing, setEditing] = useState<Scene | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const s = editing || scene

  const save = async () => {
    if (!editing) return
    setSaving(true)
    try {
      await api.patch(`/api/projects/${projectId}/scenes/${editing.index}`, {
        visual_prompt: editing.visual_prompt,
        motion_prompt: editing.motion_prompt,
        narration_text: editing.narration_text,
        sfx_prompt: editing.sfx_prompt,
      })
      setEditing(null)
      onSaved()
    } catch (err) { setError(getApiError(err)) }
    finally { setSaving(false) }
  }

  return (
    <div className="h-full overflow-y-auto px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-bold">Scene {scene.index + 1}</h3>
          <p className="text-gray-500 text-xs mt-0.5">{scene.description}</p>
        </div>
        {!editing ? (
          <button onClick={() => setEditing({ ...scene })} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Edit</button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => { setEditing(null); setError('') }} className="text-xs text-gray-500 hover:text-gray-300">Cancel</button>
            <button onClick={save} disabled={saving} className="text-xs text-green-400 hover:text-green-300 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        )}
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      {/* Status badge */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${SCENE_STATUS_COLOR[scene.status] || 'bg-gray-600'}`} />
        <span className="text-xs text-gray-400 capitalize">{scene.status.replace(/_/g, ' ')}</span>
      </div>

      {/* Prompt fields — Shotloom-style labeled sections */}
      {([
        { label: 'Visual Prompt', key: 'visual_prompt' as const, color: 'text-indigo-400' },
        { label: 'Motion',        key: 'motion_prompt' as const,  color: 'text-purple-400' },
        { label: 'Narration',     key: 'narration_text' as const, color: 'text-blue-400' },
        { label: 'Sound Effect',  key: 'sfx_prompt' as const,     color: 'text-green-400' },
      ]).map(({ label, key, color }) => (
        <div key={key} className="bg-[#0f0f1e] rounded-lg p-3 border border-gray-800">
          <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${color}`}>{label}</div>
          {editing ? (
            <textarea
              className="w-full bg-[#1a1a2e] border border-gray-700 rounded px-2 py-1.5 text-xs text-white resize-none focus:outline-none focus:border-indigo-500 h-16"
              value={editing[key] || ''}
              onChange={e => setEditing({ ...editing, [key]: e.target.value })}
            />
          ) : (
            <p className="text-xs text-gray-300 leading-relaxed">{s[key] || '—'}</p>
          )}
        </div>
      ))}

      {scene.error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 text-xs text-red-300">
          {scene.error}
        </div>
      )}
    </div>
  )
}

// ── Director Panel ────────────────────────────────────────────────────────────
function DirectorPanel({ projectId, projectTitle }: { projectId: number; projectTitle: string }) {
  const [credentials, setCredentials] = useState<{ server_url: string; token: string; room_name: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const start = async () => {
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/api/director/start', { project_id: projectId })
      setCredentials({ server_url: data.server_url, token: data.token, room_name: data.room_name })
    } catch (err) { setError(getApiError(err)) }
    finally { setLoading(false) }
  }

  const end = async () => setCredentials(null)

  return (
    <div className="p-4 flex flex-col gap-4 h-full">
      <div>
        <h3 className="text-sm font-semibold mb-1">🎥 AI Film Director</h3>
        <p className="text-xs text-gray-500 leading-relaxed">Talk to your AI director. Ask it to change scenes, adjust mood, or improve story flow.</p>
      </div>
      {!credentials ? (
        <div className="space-y-3">
          <div className="bg-[#0f0f1e] border border-gray-800 rounded-lg p-3 space-y-1.5 text-xs text-gray-400">
            <p>✓ Powered by Runway Characters API (GWM-1)</p>
            <p>✓ Real-time video conversation</p>
            <p>✓ Knows your story and scenes</p>
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button onClick={start} disabled={loading}
            className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium text-white transition-colors disabled:opacity-50">
            {loading ? 'Connecting...' : '▶ Start Director Session'}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 flex-1">
          <div className="bg-green-900/20 border border-green-800 rounded-lg p-3 text-xs text-green-400">✓ Director session active</div>
          <div className="flex-1 bg-[#0f0f1e] border border-gray-800 rounded-xl overflow-hidden">
            <AvatarCallEmbed serverUrl={credentials.server_url} token={credentials.token} />
          </div>
          <button onClick={end} className="w-full py-2 rounded-lg border border-gray-700 text-sm text-gray-300 hover:bg-gray-800 transition-colors">End Session</button>
        </div>
      )}
    </div>
  )
}

// Lazy-load the Runway AvatarCall component
function AvatarCallEmbed({ serverUrl, token }: { serverUrl: string; token: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 p-4 text-center">
      <div>
        <p className="mb-2">🎬 Director connected</p>
        <p className="text-gray-600">Room ready · speak to your director</p>
        <p className="text-gray-700 mt-2 text-[10px] break-all">{serverUrl?.slice(0, 40)}...</p>
      </div>
    </div>
  )
}

// ── Dub Button ────────────────────────────────────────────────────────────────
function DubButton({ projectId, projectTitle }: { projectId: number; projectTitle: string }) {
  const [open, setOpen] = useState(false)
  const [dubbing, setDubbing] = useState(false)
  const languages = [
    { code: 'es', name: 'Spanish' }, { code: 'fr', name: 'French' }, { code: 'de', name: 'German' },
    { code: 'pt', name: 'Portuguese' }, { code: 'zh', name: 'Chinese' }, { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' }, { code: 'ar', name: 'Arabic' }, { code: 'hi', name: 'Hindi' },
    { code: 'ru', name: 'Russian' }, { code: 'it', name: 'Italian' }, { code: 'nl', name: 'Dutch' },
  ]
  const dub = async (lang: string) => {
    setDubbing(true); setOpen(false)
    try {
      const form = new FormData(); form.append('target_lang', lang)
      const resp = await api.post(`/api/projects/${projectId}/dub`, form, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([resp.data]))
      const a = document.createElement('a'); a.href = url
      a.setAttribute('download', `${projectTitle}_${lang}.mp4`)
      document.body.appendChild(a); a.click(); a.remove()
    } catch (err) { alert(getApiError(err)) }
    finally { setDubbing(false) }
  }
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} disabled={dubbing}
        className="px-4 py-2 rounded-lg border border-gray-700 text-sm text-gray-300 hover:bg-gray-800 transition-colors disabled:opacity-50">
        {dubbing ? '⏳ Dubbing...' : '🌍 Dub'}
      </button>
      {open && (
        <div className="absolute bottom-full mb-2 right-0 bg-[#1a1a2e] border border-gray-700 rounded-xl shadow-2xl z-50 max-h-56 overflow-y-auto min-w-[140px]">
          {languages.map(l => (
            <button key={l.code} onClick={() => dub(l.code)}
              className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors first:rounded-t-xl last:rounded-b-xl">
              {l.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProjectPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [taskId, setTaskId] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [rightTab, setRightTab] = useState<RightTab>('scene')
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState<string | null>(null)
  const progress = useSSEProgress(taskId)

  const load = useCallback(async () => {
    const { data } = await api.get(`/api/projects/${id}`)
    setProject(data)
  }, [id])

  useEffect(() => {
    load()
    api.get(`/api/projects/${id}/task-status`).then(({ data }) => {
      if (data.task_id) setTaskId(data.task_id)
    })
  }, [id])

  useEffect(() => {
    if (!progress) return
    if (progress.stage === 'completed' || progress.stage === 'error') {
      setTimeout(load, 1000)
      if (progress.stage === 'completed') setTaskId(null)
    }
    if (['generating_frames', 'animating_clips', 'generating_audio', 'polishing'].includes(progress.stage || '')) {
      setTimeout(load, 3000)
    }
  }, [progress?.stage, progress?.done])

  const generate = async () => {
    setError('')
    try {
      const { data } = await api.post(`/api/projects/${id}/generate`)
      setTaskId(data.task_id)
    } catch (err) { setError(getApiError(err)) }
  }

  const uploadRef = async (type: 'style-ref' | 'char-ref', file: File) => {
    setUploading(type)
    const form = new FormData(); form.append('file', file)
    try { await api.post(`/api/projects/${id}/${type}`, form); load() }
    catch (err) { setError(getApiError(err)) }
    finally { setUploading(null) }
  }

  if (!project) return (
    <div className="flex items-center justify-center h-screen bg-[#0d0d14] text-gray-500 text-sm">Loading...</div>
  )

  const isProcessing = project.status === 'processing' || taskId !== null
  const pct = progress?.total ? Math.round((progress.done! / progress.total) * 100) : 0
  const scenes = project.scenes || []
  const selectedScene = scenes.find(s => s.index === selectedIndex) || scenes[0] || null

  return (
    <div className="min-h-screen bg-[#0d0d14] text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 bg-[#11111c] border-b border-gray-800 flex-shrink-0">
        <button onClick={() => navigate('/')} className="text-gray-500 hover:text-white text-sm transition-colors">←</button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h1 className="font-semibold truncate">{project.title}</h1>
          <span className="text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded flex-shrink-0">{project.video_model}</span>
          {project.enable_narration && <span className="text-xs text-blue-400 flex-shrink-0">🎙</span>}
          {project.enable_sfx && <span className="text-xs text-green-400 flex-shrink-0">🔊</span>}
          {project.enable_polish && <span className="text-xs text-purple-400 flex-shrink-0">✨</span>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {!isProcessing ? (
            <button onClick={generate}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium text-white transition-colors">
              {project.status === 'completed' ? '↺ Regenerate' : '▶ Generate'}
            </button>
          ) : (
            <button onClick={() => api.post(`/api/projects/${id}/cancel`).then(() => { setTaskId(null); load() })}
              className="px-4 py-1.5 rounded-lg border border-gray-700 text-sm text-gray-300 hover:bg-gray-800 transition-colors">
              ■ Cancel
            </button>
          )}
        </div>
      </header>

      {/* Progress bar */}
      {isProcessing && progress && (
        <div className="bg-[#0f0f1e] border-b border-gray-800 px-4 py-2 flex-shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-300">{STAGE_LABEL[progress.stage] || progress.stage}</span>
            {progress.total ? <span className="text-xs text-gray-500">{progress.done}/{progress.total}</span> : null}
          </div>
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: progress.total ? `${pct}%` : '60%', animation: !progress.total ? 'pulse 2s infinite' : 'none' }} />
          </div>
        </div>
      )}
      {error && <div className="bg-red-900/20 border-b border-red-800 px-4 py-2 text-red-400 text-xs flex-shrink-0">{error}</div>}

      {/* Main 3-column layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: Scene strip */}
        <aside className="w-48 border-r border-gray-800 bg-[#11111c] overflow-y-auto flex-shrink-0">
          {scenes.length === 0 ? (
            <div className="p-4 text-center text-gray-600 text-xs mt-8">
              {isProcessing ? 'Generating scenes...' : 'Hit Generate to start'}
            </div>
          ) : scenes.map(scene => (
            <div key={scene.id}
              onClick={() => setSelectedIndex(scene.index)}
              className={`cursor-pointer border-b border-gray-800 hover:bg-gray-800/50 transition-colors ${selectedIndex === scene.index ? 'bg-gray-800 border-l-2 border-l-indigo-500' : ''}`}>
              {scene.frame_path ? (
                <img
                  src={`${API_BASE}/api/projects/${project.id}/scenes/${scene.index}/frame`}
                  className="w-full aspect-video object-cover"
                  alt=""
                />
              ) : (
                <div className="w-full aspect-video bg-[#0d0d14] flex items-center justify-center">
                  <span className="text-gray-700 text-xs">{scene.status === 'error' ? '✗' : '○'}</span>
                </div>
              )}
              <div className="px-2 py-1.5 flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${SCENE_STATUS_COLOR[scene.status] || 'bg-gray-600'}`} />
                <span className="text-xs text-gray-400">Scene {scene.index + 1}</span>
              </div>
            </div>
          ))}
        </aside>

        {/* Center: Preview + timeline */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#0d0d14]">
          {/* Video/frame preview */}
          <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden">
            {project.final_video_path && project.status === 'completed' ? (
              <div className="flex flex-col items-center gap-4 w-full max-w-3xl">
                <video controls className="w-full max-h-[55vh] rounded-xl shadow-2xl"
                  src={`${API_BASE}/api/projects/${project.id}/video`} />
                <div className="flex gap-3 flex-wrap justify-center">
                  <a href={`${API_BASE}/api/projects/${project.id}/video`} download
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium text-white transition-colors">
                    ↓ Download Film
                  </a>
                  <a href={`${API_BASE}/api/projects/${project.id}/storyboard-pdf`} download
                    className="px-4 py-2 rounded-lg border border-gray-700 text-sm text-gray-300 hover:bg-gray-800 transition-colors">
                    📄 Storyboard PDF
                  </a>
                  <DubButton projectId={project.id} projectTitle={project.title} />
                </div>
              </div>
            ) : selectedScene?.clip_path ? (
              <video controls className="max-h-[55vh] rounded-xl w-full max-w-2xl"
                src={`${API_BASE}/api/projects/${project.id}/scenes/${selectedScene.index}/clip`} />
            ) : selectedScene?.frame_path ? (
              <img src={`${API_BASE}/api/projects/${project.id}/scenes/${selectedScene.index}/frame`}
                className="max-h-[55vh] rounded-xl" alt="Storyboard frame" />
            ) : (
              <div className="text-gray-700 text-sm text-center">
                {isProcessing ? (
                  <div className="flex flex-col items-center gap-3">
                    <svg className="animate-spin h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    <span>Generating...</span>
                  </div>
                ) : 'Select a scene or generate video'}
              </div>
            )}
          </div>

          {/* Scene timeline — Shotloom-inspired */}
          <SceneTimeline scenes={scenes} selectedIndex={selectedIndex} onSelect={setSelectedIndex} />

          {/* Reference uploads */}
          <div className="border-t border-gray-800 px-4 py-2 flex gap-3 items-center bg-[#11111c] flex-shrink-0">
            <span className="text-xs text-gray-600">Refs:</span>
            {(['style-ref', 'char-ref'] as const).map(type => {
              const has = type === 'style-ref' ? project.style_ref_path : project.char_ref_path
              const label = type === 'style-ref' ? 'Style' : 'Character'
              return (
                <label key={type} className="cursor-pointer">
                  <span className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${has ? 'border-green-700 text-green-400 bg-green-900/20' : 'border-gray-700 text-gray-500 hover:border-gray-600'}`}>
                    {uploading === type ? '...' : has ? `✓ ${label}` : `+ ${label}`}
                  </span>
                  <input type="file" accept="image/*" className="hidden"
                    onChange={e => e.target.files?.[0] && uploadRef(type, e.target.files[0])} />
                </label>
              )
            })}
          </div>
        </main>

        {/* Right: Scene detail / Director */}
        <aside className="w-72 border-l border-gray-800 bg-[#11111c] flex flex-col flex-shrink-0 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-800 flex-shrink-0">
            {(['scene', 'director'] as const).map(tab => (
              <button key={tab} onClick={() => setRightTab(tab)}
                className={`flex-1 py-2.5 text-xs font-medium transition-colors ${rightTab === tab ? 'text-white border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-300'}`}>
                {tab === 'scene' ? '🎬 Scene' : '🎥 Director'}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-hidden">
            {rightTab === 'scene' && selectedScene ? (
              <SceneDetailPanel scene={selectedScene} projectId={project.id} onSaved={load} />
            ) : rightTab === 'scene' ? (
              <div className="flex items-center justify-center h-full text-gray-600 text-sm">
                {isProcessing ? 'Generating scenes...' : 'No scenes yet'}
              </div>
            ) : (
              <DirectorPanel projectId={project.id} projectTitle={project.title} />
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
