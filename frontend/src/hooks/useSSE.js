import { useEffect, useState, useRef } from 'react'

export default function useSSE(shortId, token) {
  const [clicks, setClicks] = useState([])
  const [connected, setConnected] = useState(false)
  const sourceRef = useRef(null)

  useEffect(() => {
    if (!shortId || !token) return

    const url = `${import.meta.env.VITE_API_URL}/api/stream/${shortId}?token=${token}`
    const source = new EventSource(url)
    sourceRef.current = source

    source.onopen = () => setConnected(true)

    source.onmessage = (e) => {
      const data = JSON.parse(e.data)
      if (data.type === 'click') {
        setClicks(prev => [...prev, data])
      }
    }

    source.onerror = () => {
      setConnected(false)
      source.close()
    }

    return () => {
      source.close()
      setConnected(false)
    }
  }, [shortId, token])

  return { clicks, connected }
}
