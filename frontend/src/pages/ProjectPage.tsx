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
  video_model: string; video_ratio: string; enable_narration: boolean; enable_sfx: boolean
  enable_subtitles: boolean; enable_polish: boolean; polish_prompt: string | null
  style_ref_path: string | null; char_ref_path: string | null
  storyboard_pdf_path: string | null
  scenes: Scene[]
}

const STAGE_LABEL: Record<string, string> = {
  starting: 'Starting...', parsing_story: 'Analyzing story...',
  generating_frames: 'Generating storyboard frames...',
  animating_clips: 'Animating scenes...',
  generating_audio: 'Generating narration & sound effects...',
  polishing: 'Applying cinematic polish (gen4_aleph)...',
  assembling_video: 'Assembling final video...',
  completed: 'Complete!', error: 'Error', cancelled: 'Cancelled',
}

const STATUS_DOT: Record<string, string> = {
  pending: 'bg-gray-600', generating_frame: 'bg-yellow-400 animate-pulse',
  frame_done: 'bg-blue-400', generating_clip: 'bg-purple-400 animate-pulse',
  clip_done: 'bg-indigo-400', completed: 'bg-green-400', error: 'bg-red-400',
}

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [taskId, setTaskId] = useState<string | null>(null)
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null)
  const [editingScene, setEditingScene] = useState<Scene | null>(null)
  const [activeTab, setActiveTab] = useState<'detail' | 'director'>('detail')
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState<string | null>(null)
  const progress = useSSEProgress(taskId)

  const load = useCallback(async () => {
    const { data } = await api.get(`/api/projects/${id}`)
    setProject(data)
    if (data.scenes?.length > 0 && !selectedScene) setSelectedScene(data.scenes[0])
  }, [id])

  useEffect(() => {
    load()
    api.get(`/api/projects/${id}/task-status`).then(({ data }) => {
      if (data.task_id) setTaskId(data.task_id)
    })
  }, [id])

  useEffect(() => {
    if (progress?.stage === 'completed' || progress?.stage === 'error') {
      setTimeout(load, 1000)
      if (progress.stage === 'completed') setTaskId(null)
    }
    if (['generating_frames','animating_clips','generating_audio','polishing'].includes(progress?.stage || '')) {
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

  const saveScene = async () => {
    if (!editingScene) return
    try {
      await api.patch(`/api/projects/${id}/scenes/${editingScene.index}`, {
        visual_prompt: editingScene.visual_prompt,
        motion_prompt: editingScene.motion_prompt,
        narration_text: editingScene.narration_text,
        sfx_prompt: editingScene.sfx_prompt,
      })
      setSelectedScene(editingScene)
      setEditingScene(null)
      load()
    } catch (err) { setError(getApiError(err)) }
  }

  const uploadRef = async (type: 'style-ref' | 'char-ref', file: File) => {
    setUploading(type)
    const form = new FormData()
    form.append('file', file)
    try {
      await api.post(`/api/projects/${id}/${type}`, form)
      load()
    } catch (err) { setError(getApiError(err)) }
    finally { setUploading(null) }
  }

  if (!project) return <div className="flex items-center justify-center h-screen text-gray-400">Loading...</div>

  const isProcessing = project.status === 'processing' || taskId !== null
  const pct = progress?.total ? Math.round((progress.done! / progress.total) * 100) : 0
  const displayScene = editingScene || selectedScene

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-3 flex items-center gap-4">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white text-sm">← Back</button>
        <h1 className="font-semibold flex-1">{project.title}</h1>
        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">{project.video_model}</span>
        {project.enable_narration && <span className="text-xs text-blue-400">🎙 Narration</span>}
        {project.enable_sfx && <span className="text-xs text-green-400">🔊 SFX</span>}
        {project.enable_polish && <span className="text-xs text-purple-400">✨ Polish</span>}
        {!isProcessing && (
          <button className="btn-primary text-sm" onClick={generate}>
            {project.status === 'completed' ? '↺ Regenerate' : '▶ Generate Video'}
          </button>
        )}
        {isProcessing && <button className="btn-secondary text-sm" onClick={() => api.post(`/api/projects/${id}/cancel`).then(() => { setTaskId(null); load() })}>■ Cancel</button>}
      </header>

      {/* Progress */}
      {isProcessing && progress && (
        <div className="bg-gray-900 border-b border-gray-800 px-6 py-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-300">{STAGE_LABEL[progress.stage] || progress.stage}</span>
            {progress.total ? <span className="text-xs text-gray-500">{progress.done}/{progress.total}</span> : null}
          </div>
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: progress.total ? `${pct}%` : '100%', animation: !progress.total ? 'pulse 2s infinite' : 'none' }} />
          </div>
        </div>
      )}
      {error && <div className="bg-red-900/30 border-b border-red-800 px-6 py-2 text-red-400 text-xs">{error}</div>}

      <div className="flex flex-1 overflow-hidden">
        {/* Scene list */}
        <aside className="w-56 border-r border-gray-800 overflow-y-auto bg-gray-900 flex-shrink-0">
          {project.scenes.length === 0 ? (
            <div className="p-4 text-gray-500 text-xs text-center mt-8">
              {isProcessing ? 'Generating scenes...' : 'Hit Generate to start'}
            </div>
          ) : project.scenes.map(scene => (
            <div key={scene.id}
              className={`p-2 cursor-pointer border-b border-gray-800 hover:bg-gray-800 transition-colors ${selectedScene?.id === scene.id ? 'bg-gray-800 border-l-2 border-l-indigo-500' : ''}`}
              onClick={() => { setSelectedScene(scene); setEditingScene(null) }}>
              {scene.frame_path ? (
                <img src={`${API_BASE}/api/projects/${project.id}/scenes/${scene.index}/frame`}
                  className="w-full aspect-video object-cover rounded mb-1" alt="" />
              ) : (
                <div className="w-full aspect-video bg-gray-800 rounded mb-1 flex items-center justify-center">
                  <span className="text-gray-600 text-xs">{scene.status === 'error' ? '✗' : '○'}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[scene.status] || 'bg-gray-600'}`} />
                <p className="text-xs text-gray-400 truncate">Scene {scene.index + 1}</p>
              </div>
            </div>
          ))}
        </aside>

        {/* Center: preview */}
        <main className="flex-1 flex flex-col overflow-hidden bg-gray-950">
          {project.final_video_path && project.status === 'completed' ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
              <video controls className="max-h-[60vh] rounded-xl shadow-2xl w-full max-w-3xl"
                src={`${API_BASE}/api/projects/${project.id}/video`} />
              <div className="flex gap-3">
                <a href={`${API_BASE}/api/projects/${project.id}/video`} download className="btn-primary">
                  ↓ Download Film
                </a>
                <a href={`${API_BASE}/api/projects/${project.id}/storyboard-pdf`} download className="btn-secondary">
                  📄 Storyboard PDF
                </a>
                <DubButton projectId={project.id} projectTitle={project.title} />
              </div>
            </div>
          ) : displayScene?.clip_path ? (
            <div className="flex-1 flex items-center justify-center p-4">
              <video controls className="max-h-[60vh] rounded-xl w-full max-w-2xl"
                src={`${API_BASE}/api/projects/${project.id}/scenes/${displayScene.index}/clip`} />
            </div>
          ) : displayScene?.frame_path ? (
            <div className="flex-1 flex items-center justify-center p-4">
              <img src={`${API_BASE}/api/projects/${project.id}/scenes/${displayScene.index}/frame`}
                className="max-h-[60vh] rounded-xl" alt="Storyboard frame" />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">
              {isProcessing ? 'Generating...' : 'Select a scene or generate video'}
            </div>
          )}

          {/* Reference image uploads */}
          <div className="border-t border-gray-800 px-4 py-2 flex gap-4 items-center bg-gray-900">
            <span className="text-xs text-gray-500">References:</span>
            <label className="cursor-pointer">
              <span className={`text-xs px-2 py-1 rounded border ${project.style_ref_path ? 'border-green-600 text-green-400' : 'border-gray-700 text-gray-400'} hover:border-gray-500`}>
                {uploading === 'style-ref' ? '...' : project.style_ref_path ? '✓ Style Ref' : '+ Style Ref'}
              </span>
              <input type="file" accept="image/*" className="hidden"
                onChange={e => e.target.files?.[0] && uploadRef('style-ref', e.target.files[0])} />
            </label>
            <label className="cursor-pointer">
              <span className={`text-xs px-2 py-1 rounded border ${project.char_ref_path ? 'border-green-600 text-green-400' : 'border-gray-700 text-gray-400'} hover:border-gray-500`}>
                {uploading === 'char-ref' ? '...' : project.char_ref_path ? '✓ Character Ref' : '+ Character Ref'}
              </span>
              <input type="file" accept="image/*" className="hidden"
                onChange={e => e.target.files?.[0] && uploadRef('char-ref', e.target.files[0])} />
            </label>
          </div>
        </main>

        {/* Right panel */}
        <aside className="w-80 border-l border-gray-800 overflow-y-auto bg-gray-900 flex-shrink-0 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-gray-800">
            {(['detail', 'director'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-xs font-medium transition-colors ${activeTab === tab ? 'text-white border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-300'}`}>
                {tab === 'detail' ? '🎬 Scene' : '🎥 Director'}
              </button>
            ))}
          </div>

          {activeTab === 'detail' && displayScene && (
            <div className="p-4 space-y-4 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Scene {displayScene.index + 1}</h3>
                {!editingScene ? (
                  <button onClick={() => setEditingScene({...displayScene})} className="text-xs text-indigo-400 hover:text-indigo-300">Edit</button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setEditingScene(null)} className="text-xs text-gray-500">Cancel</button>
                    <button onClick={saveScene} className="text-xs text-green-400 hover:text-green-300">Save</button>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-400">{displayScene.description}</p>

              {/* Feature 3: Editable prompts */}
              {[
                { label: 'Visual Prompt', key: 'visual_prompt' as const },
                { label: 'Motion Prompt', key: 'motion_prompt' as const },
                { label: 'Narration', key: 'narration_text' as const },
                { label: 'Sound Effect', key: 'sfx_prompt' as const },
              ].map(({ label, key }) => (
                <div key={key}>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</h4>
                  {editingScene ? (
                    <textarea
                      className="input text-xs h-16 resize-none"
                      value={editingScene[key] || ''}
                      onChange={e => setEditingScene({...editingScene, [key]: e.target.value})}
                    />
                  ) : (
                    <p className="text-xs text-gray-400 leading-relaxed">{displayScene[key] || '—'}</p>
                  )}
                </div>
              ))}

              {displayScene.error && (
                <div className="bg-red-900/30 rounded p-2">
                  <p className="text-xs text-red-400">{displayScene.error}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'director' && (
            <DirectorPanel projectId={project.id} projectTitle={project.title} />
          )}
        </aside>
      </div>
    </div>
  )
}

// Feature 8: Director Panel
function DirectorPanel({ projectId, projectTitle }: { projectId: number; projectTitle: string }) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const startSession = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/api/director/start', { project_id: projectId })
      setSessionId(data.session_id)
    } catch (err) {
      setError(getApiError(err))
    } finally { setLoading(false) }
  }

  const endSession = async () => {
    if (sessionId) await api.delete(`/api/director/session/${sessionId}`)
    setSessionId(null)
  }

  return (
    <div className="p-4 flex-1 flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold mb-1">🎥 AI Film Director</h3>
        <p className="text-xs text-gray-500">Talk to your AI director. Ask it to change scenes, adjust the mood, or improve the story flow.</p>
      </div>

      {!sessionId ? (
        <div className="space-y-3">
          <div className="bg-gray-800 rounded-lg p-3 text-xs text-gray-400 space-y-1">
            <p>✓ Powered by Runway Characters API (GWM-1)</p>
            <p>✓ Real-time video conversation</p>
            <p>✓ Can trigger scene regeneration</p>
            <p>✓ Knows your story and scenes</p>
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button className="btn-primary w-full text-sm" onClick={startSession} disabled={loading}>
            {loading ? 'Connecting...' : '▶ Start Director Session'}
          </button>
        </div>
      ) : (
        <div className="space-y-3 flex-1 flex flex-col">
          <div className="bg-green-900/30 border border-green-800 rounded-lg p-3 text-xs text-green-400">
            ✓ Director session active
          </div>
          <p className="text-xs text-gray-500">
            Open the Runway Characters widget to talk to your director. The director can suggest changes and update scene prompts directly.
          </p>
          {/* Runway Characters embedded widget */}
          <div className="flex-1 bg-gray-800 rounded-lg flex items-center justify-center text-gray-600 text-xs p-4 text-center">
            Session ID: {sessionId}<br/>
            <span className="text-gray-700 mt-1 block">Embed Runway widget here using @runwayml/avatars-sdk-react</span>
          </div>
          <button className="btn-secondary w-full text-sm" onClick={endSession}>End Session</button>
        </div>
      )}
    </div>
  )
}

// Multi-language dubbing button
function DubButton({ projectId, projectTitle }: { projectId: number; projectTitle: string }) {
  const [showMenu, setShowMenu] = useState(false)
  const [dubbing, setDubbing] = useState(false)

  const languages = [
    { code: 'es', name: 'Spanish' }, { code: 'fr', name: 'French' }, { code: 'de', name: 'German' },
    { code: 'pt', name: 'Portuguese' }, { code: 'zh', name: 'Chinese' }, { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' }, { code: 'ar', name: 'Arabic' }, { code: 'hi', name: 'Hindi' },
    { code: 'ru', name: 'Russian' }, { code: 'it', name: 'Italian' }, { code: 'nl', name: 'Dutch' },
  ]

  const dub = async (lang: string) => {
    setDubbing(true)
    setShowMenu(false)
    try {
      const form = new FormData()
      form.append('target_lang', lang)
      const resp = await api.post(`/api/projects/${projectId}/dub`, form, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([resp.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${projectTitle}_${lang}.mp4`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      alert(getApiError(err))
    } finally {
      setDubbing(false)
    }
  }

  return (
    <div className="relative">
      <button className="btn-secondary" onClick={() => setShowMenu(!showMenu)} disabled={dubbing}>
        {dubbing ? '⏳ Dubbing...' : '🌍 Dub to Language'}
      </button>
      {showMenu && (
        <div className="absolute top-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
          {languages.map(l => (
            <button key={l.code} onClick={() => dub(l.code)}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 whitespace-nowrap">
              {l.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
