import { useState, useEffect, useRef } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export interface TaskProgress {
  stage: 'starting' | 'parsing_story' | 'generating_frames' | 'animating_clips' | 'generating_audio' | 'polishing' | 'assembling_video' | 'completed' | 'error' | 'cancelled' | 'not_found' | 'idle'
  done?: number
  total?: number
  msg?: string
}

export function useSSEProgress(taskId: string | null): TaskProgress | null {
  const [progress, setProgress] = useState<TaskProgress | null>(null)
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!taskId) { setProgress(null); return }
    setProgress({ stage: 'starting' })

    const es = new EventSource(`${API_BASE}/api/progress/${taskId}`, { withCredentials: true })
    esRef.current = es

    es.onmessage = (e) => {
      const data: TaskProgress = JSON.parse(e.data)
      setProgress(data)
      if (['completed', 'error', 'cancelled', 'not_found'].includes(data.stage)) {
        setTimeout(() => es.close(), 0)
      }
    }
    es.onerror = () => es.close()

    return () => es.close()
  }, [taskId])

  return progress
}
