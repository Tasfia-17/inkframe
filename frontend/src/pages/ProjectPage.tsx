import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AvatarCall } from '@runwayml/avatars-react'
import '@runwayml/avatars-react/styles.css'
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
  starting:         'Starting…',
  parsing_story:    'Rewriting for visual storytelling & extracting continuity…',
  generating_frames:'Generating storyboard frames…',
  animating_clips:  'Animating scenes…',
  generating_audio: 'Generating narration & sound effects…',
  polishing:        'Applying cinematic polish…',
  assembling_video: 'Assembling final video…',
  completed: 'Complete!', error: 'Error', cancelled: 'Cancelled',
}

const SCENE_DOT: Record<string, string> = {
  pending:          'bg-[#d4cfc4]',
  generating_frame: 'bg-amber-400 animate-pulse',
  frame_done:       'bg-blue-400',
  generating_clip:  'bg-purple-400 animate-pulse',
  clip_done:        'bg-indigo-400',
  completed:        'bg-storygreen',
  error:            'bg-red-400',
}

// ── Scene Timeline ────────────────────────────────────────────────────────────
function SceneTimeline({ scenes, selectedIndex, onSelect }: {
  scenes: Scene[]; selectedIndex: number; onSelect: (i: number) => void
}) {
  if (!scenes.length) return null
  return (
    <div className="px-4 py-2 bg-white border-t border-border">
      <div className="relative h-8 bg-vellum rounded-lg overflow-hidden flex border border-border">
        {scenes.map(s => {
          const isSelected = s.index === selectedIndex
          const hasClip = !!s.clip_path
          const hasFrame = !!s.frame_path
          return (
            <div key={s.index}
              title={`Scene ${s.index + 1} — ${s.description?.slice(0, 60) || ''}`}
              onClick={() => onSelect(s.index)}
              style={{ width: `${100 / scenes.length}%` }}
              className={`relative h-full border-r border-border cursor-pointer transition-colors last:border-0
                ${isSelected ? 'bg-charcoal' : hasClip ? 'bg-inkwell/10 hover:bg-inkwell/20' : hasFrame ? 'bg-blue-100 hover:bg-blue-200' : 'hover:bg-[#ede9e0]'}`}>
              <span className={`absolute bottom-0.5 left-1 text-[9px] leading-none pointer-events-none select-none ${isSelected ? 'text-white' : 'text-mutedgray'}`}>
                {s.index + 1}
              </span>
              {(s.status === 'generating_frame' || s.status === 'generating_clip') && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              )}
            </div>
          )
        })}
      </div>
      <div className="flex justify-between text-[10px] text-mutedgray mt-1 px-0.5">
        <span>Scene 1</span><span>Scene {scenes.length}</span>
      </div>
    </div>
  )
}

// ── Scene Detail Panel ────────────────────────────────────────────────────────
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
        visual_prompt: editing.visual_prompt, motion_prompt: editing.motion_prompt,
        narration_text: editing.narration_text, sfx_prompt: editing.sfx_prompt,
      })
      setEditing(null); onSaved()
    } catch (err) { setError(getApiError(err)) }
    finally { setSaving(false) }
  }

  return (
    <div className="h-full overflow-y-auto px-4 py-4 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-serif text-lg text-charcoal">Scene {scene.index + 1}</h3>
          <p className="text-xs text-mutedgray mt-0.5 leading-relaxed">{scene.description}</p>
        </div>
        {!editing ? (
          <button onClick={() => setEditing({ ...scene })} className="text-xs text-mutedgray hover:text-charcoal underline underline-offset-2 flex-shrink-0 ml-2">Edit</button>
        ) : (
          <div className="flex gap-2 flex-shrink-0 ml-2">
            <button onClick={() => { setEditing(null); setError('') }} className="text-xs text-mutedgray hover:text-charcoal">Cancel</button>
            <button onClick={save} disabled={saving} className="text-xs text-storygreen hover:text-green-700 font-medium disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${SCENE_DOT[scene.status] || 'bg-[#d4cfc4]'}`} />
        <span className="text-xs text-mutedgray capitalize">{scene.status.replace(/_/g, ' ')}</span>
      </div>

      {error && <p className="text-red-600 text-xs">{error}</p>}

      {([
        { label: 'Visual prompt', key: 'visual_prompt' as const },
        { label: 'Motion',        key: 'motion_prompt' as const },
        { label: 'Narration',     key: 'narration_text' as const },
        { label: 'Sound effect',  key: 'sfx_prompt' as const },
      ]).map(({ label, key }) => (
        <div key={key} className="bg-vellum rounded-lg p-3 border border-border">
          <div className="text-xs font-medium text-mutedgray uppercase tracking-wider mb-1.5">{label}</div>
          {editing ? (
            <textarea className="w-full bg-white border border-borderdark rounded px-2 py-1.5 text-xs text-inkwell resize-none focus:outline-none focus:border-charcoal h-16"
              value={editing[key] || ''} onChange={e => setEditing({ ...editing, [key]: e.target.value })} />
          ) : (
            <p className="text-xs text-bookgray leading-relaxed">{s[key] || '—'}</p>
          )}
        </div>
      ))}

      {scene.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-600">{scene.error}</div>
      )}
    </div>
  )
}

// ── Director Panel ────────────────────────────────────────────────────────────
function DirectorPanel({ projectId }: { projectId: number }) {
  const [sessionData, setSessionData] = useState<{ session_id: string; server_url: string; token: string; room_name: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const start = async () => {
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/api/director/start', { project_id: projectId })
      setSessionData(data)
    } catch (err) { setError(getApiError(err)) }
    finally { setLoading(false) }
  }

  const end = async () => {
    if (sessionData) {
      await api.delete(`/api/director/session/${sessionData.session_id}`).catch(() => {})
    }
    setSessionData(null)
  }

  return (
    <div className="p-4 flex flex-col gap-4 h-full">
      <div>
        <h3 className="font-serif text-lg text-charcoal mb-1">AI Director</h3>
        <p className="text-xs text-mutedgray leading-relaxed">Talk to your AI director. Ask it to change scenes, adjust mood, or improve story flow.</p>
      </div>
      {!sessionData ? (
        <div className="space-y-3">
          <div className="bg-vellum border border-border rounded-xl p-4 space-y-2 text-xs text-mutedgray">
            <p>✓ Powered by Runway Characters API (GWM-1)</p>
            <p>✓ Real-time video conversation</p>
            <p>✓ Knows your story and scenes</p>
          </div>
          {error && <p className="text-red-600 text-xs">{error}</p>}
          <button onClick={start} disabled={loading} className="btn-primary w-full py-2.5">
            {loading ? 'Connecting…' : '▶ Start Director Session'}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 flex-1 overflow-hidden">
          <div className="flex-1 rounded-xl overflow-hidden border border-border">
            <AvatarCall
              avatarId="director"
              credentials={{ serverUrl: sessionData.server_url, token: sessionData.token, roomName: sessionData.room_name, sessionId: sessionData.session_id }}
              onEnd={end}
              onError={(e) => { setError(e.message); setSessionData(null) }}
            />
          </div>
          <button onClick={end} className="btn-secondary w-full py-2">■ End session</button>
        </div>
      )}
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
      <button onClick={() => setOpen(!open)} disabled={dubbing} className="btn-secondary text-sm">
        {dubbing ? '⏳ Dubbing…' : '🌍 Dub'}
      </button>
      {open && (
        <div className="absolute bottom-full mb-2 right-0 bg-white border border-border rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto min-w-[140px]">
          {languages.map(l => (
            <button key={l.code} onClick={() => dub(l.code)}
              className="block w-full text-left px-4 py-2 text-sm text-inkwell hover:bg-vellum transition-colors first:rounded-t-xl last:rounded-b-xl">
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
  const [rightTab, setRightTab] = useState<'scene' | 'director'>('scene')
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
    <div className="min-h-screen bg-vellum flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-charcoal border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const isProcessing = project.status === 'processing' || taskId !== null
  const pct = progress?.total ? Math.round((progress.done! / progress.total) * 100) : 0
  const scenes = project.scenes || []
  const selectedScene = scenes.find(s => s.index === selectedIndex) || scenes[0] || null

  return (
    <div className="min-h-screen bg-vellum font-sans flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-vellum/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => navigate('/home')} className="text-mutedgray hover:text-charcoal text-sm transition-colors">←</button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h1 className="font-serif text-lg text-charcoal truncate">{project.title}</h1>
          <span className="text-xs text-mutedgray border border-border rounded-full px-2 py-0.5 flex-shrink-0">{project.video_model}</span>
          {project.enable_narration && <span className="text-xs flex-shrink-0">🎙</span>}
          {project.enable_sfx && <span className="text-xs flex-shrink-0">🔊</span>}
          {project.enable_polish && <span className="text-xs flex-shrink-0">✨</span>}
        </div>
        <div className="flex-shrink-0">
          {!isProcessing ? (
            <button onClick={generate} className="btn-primary text-sm">
              {project.status === 'completed' ? '↺ Regenerate' : '▶ Generate'}
            </button>
          ) : (
            <button onClick={() => api.post(`/api/projects/${id}/cancel`).then(() => { setTaskId(null); load() })}
              className="btn-secondary text-sm">■ Cancel</button>
          )}
        </div>
      </header>

      {/* Progress */}
      {isProcessing && progress && (
        <div className="bg-white border-b border-border px-4 py-2 flex-shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-inkwell">{STAGE_LABEL[progress.stage] || progress.stage}</span>
            {progress.total ? <span className="text-xs text-mutedgray">{progress.done}/{progress.total}</span> : null}
          </div>
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-charcoal rounded-full transition-all duration-500"
              style={{ width: progress.total ? `${pct}%` : '60%', animation: !progress.total ? 'pulse 2s infinite' : 'none' }} />
          </div>
        </div>
      )}
      {error && <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-red-600 text-xs flex-shrink-0">{error}</div>}

      {/* 3-column layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: Scene strip */}
        <aside className="w-44 border-r border-border bg-white overflow-y-auto flex-shrink-0">
          {scenes.length === 0 ? (
            <div className="p-4 text-center text-mutedgray text-xs mt-8">
              {isProcessing ? 'Generating…' : 'Hit Generate'}
            </div>
          ) : scenes.map(scene => (
            <div key={scene.id} onClick={() => setSelectedIndex(scene.index)}
              className={`cursor-pointer border-b border-border hover:bg-vellum transition-colors ${selectedIndex === scene.index ? 'bg-vellum border-l-2 border-l-charcoal' : ''}`}>
              {scene.frame_path ? (
                <img src={`${API_BASE}/api/projects/${project.id}/scenes/${scene.index}/frame`}
                  className="w-full aspect-video object-cover" alt="" />
              ) : (
                <div className="w-full aspect-video bg-vellum flex items-center justify-center">
                  <span className="text-[#c4bfb5] text-xs">{scene.status === 'error' ? '✗' : '○'}</span>
                </div>
              )}
              <div className="px-2 py-1.5 flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${SCENE_DOT[scene.status] || 'bg-[#d4cfc4]'}`} />
                <span className="text-xs text-mutedgray">Scene {scene.index + 1}</span>
              </div>
            </div>
          ))}
        </aside>

        {/* Center: Preview + timeline */}
        <main className="flex-1 flex flex-col overflow-hidden bg-vellum">
          <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-hidden">
            {project.final_video_path && project.status === 'completed' ? (
              <div className="flex flex-col items-center gap-4 w-full max-w-3xl">
                <video controls className="w-full max-h-[55vh] rounded-2xl shadow-lg border border-border"
                  src={`${API_BASE}/api/projects/${project.id}/video`} />
                <div className="flex gap-3 flex-wrap justify-center">
                  <a href={`${API_BASE}/api/projects/${project.id}/video`} download className="btn-primary">↓ Download film</a>
                  <a href={`${API_BASE}/api/projects/${project.id}/storyboard-pdf`} download className="btn-secondary">📄 Storyboard PDF</a>
                  <DubButton projectId={project.id} projectTitle={project.title} />
                </div>
              </div>
            ) : selectedScene?.clip_path ? (
              <video controls className="max-h-[55vh] rounded-2xl w-full max-w-2xl border border-border shadow"
                src={`${API_BASE}/api/projects/${project.id}/scenes/${selectedScene.index}/clip`} />
            ) : selectedScene?.frame_path ? (
              <img src={`${API_BASE}/api/projects/${project.id}/scenes/${selectedScene.index}/frame`}
                className="max-h-[55vh] rounded-2xl border border-border shadow" alt="Storyboard frame" />
            ) : (
              <div className="text-mutedgray text-sm text-center">
                {isProcessing ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-6 h-6 border-2 border-charcoal border-t-transparent rounded-full animate-spin" />
                    <span>Generating…</span>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="font-serif text-2xl text-[#c4bfb5] mb-2">✦</p>
                    <p>Select a scene or generate video</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Scene timeline */}
          <SceneTimeline scenes={scenes} selectedIndex={selectedIndex} onSelect={setSelectedIndex} />

          {/* Reference uploads */}
          <div className="border-t border-border px-4 py-2 flex gap-3 items-center bg-white flex-shrink-0">
            <span className="text-xs text-mutedgray">References:</span>
            {(['style-ref', 'char-ref'] as const).map(type => {
              const has = type === 'style-ref' ? project.style_ref_path : project.char_ref_path
              const label = type === 'style-ref' ? 'Style' : 'Character'
              return (
                <label key={type} className="cursor-pointer">
                  <span className={`text-xs px-3 py-1 rounded-full border transition-colors ${has ? 'border-storygreen text-storygreen' : 'border-borderdark text-mutedgray hover:border-charcoal hover:text-charcoal'}`}>
                    {uploading === type ? '…' : has ? `✓ ${label}` : `+ ${label}`}
                  </span>
                  <input type="file" accept="image/*" className="hidden"
                    onChange={e => e.target.files?.[0] && uploadRef(type, e.target.files[0])} />
                </label>
              )
            })}
          </div>
        </main>

        {/* Right: Scene detail / Director */}
        <aside className="w-72 border-l border-border bg-white flex flex-col flex-shrink-0 overflow-hidden">
          <div className="flex border-b border-border flex-shrink-0">
            {(['scene', 'director'] as const).map(tab => (
              <button key={tab} onClick={() => setRightTab(tab)}
                className={`flex-1 py-2.5 text-xs font-medium transition-colors ${rightTab === tab ? 'text-charcoal border-b-2 border-charcoal' : 'text-mutedgray hover:text-inkwell'}`}>
                {tab === 'scene' ? '🎬 Scene' : '🎥 Director'}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-hidden">
            {rightTab === 'scene' && selectedScene ? (
              <SceneDetailPanel scene={selectedScene} projectId={project.id} onSaved={load} />
            ) : rightTab === 'scene' ? (
              <div className="flex items-center justify-center h-full text-mutedgray text-sm">
                {isProcessing ? 'Generating scenes…' : 'No scenes yet'}
              </div>
            ) : (
              <DirectorPanel projectId={project.id} />
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
