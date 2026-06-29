import { useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react'

export default function QRModal({ shortUrl, shortId, onClose }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    function handleKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  function handleDownload() {
    const canvas = canvasRef.current?.querySelector('canvas')
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `linklens-${shortId}.png`
    a.click()
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <div
        className="relative rounded-2xl p-6 w-full max-w-sm animate-fade-up"
        style={{ background: '#161D2E', border: '1px solid #243049' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#3A4E6A] hover:text-[#F0F6FF] transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Heading */}
        <h2
          className="text-lg text-[#F0F6FF] mb-1"
          style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}
        >
          QR Code
        </h2>
        <p
          className="text-xs text-[#3A4E6A] mb-5 truncate"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {shortUrl}
        </p>

        {/* Visible QR — SVG, transparent bg */}
        <div className="flex justify-center mb-5">
          <div
            className="rounded-xl p-4"
            style={{ background: '#1E2A40', border: '1px solid #243049' }}
          >
            <QRCodeSVG
              value={shortUrl}
              size={200}
              bgColor="transparent"
              fgColor="#ffffff"
              level="H"
              includeMargin={false}
            />
          </div>
        </div>

        {/* Hidden canvas for download */}
        <div ref={canvasRef} style={{ display: 'none' }}>
          <QRCodeCanvas
            value={shortUrl}
            size={512}
            bgColor="#ffffff"
            fgColor="#000000"
            level="H"
            includeMargin={true}
          />
        </div>

        <button onClick={handleDownload} className="btn-primary w-full py-2.5 text-sm">
          Download PNG
        </button>
      </div>
    </div>,
    document.body
  )
}
