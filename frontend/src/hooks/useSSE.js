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
      // Do NOT close() here. EventSource reconnects on its own after a dropped
      // connection, and close() cancels that permanently, killing the live feed
      // until remount. A non-200 (e.g. bad token) fails without retrying anyway.
      setConnected(false)
    }

    return () => {
      source.close()
      setConnected(false)
    }
  }, [shortId, token])

  return { clicks, connected }
}
