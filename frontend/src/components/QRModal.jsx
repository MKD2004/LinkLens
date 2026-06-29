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
      style={{ background: 'rgba(26,26,20,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative rounded-2xl p-6 w-full max-w-sm animate-fade-up"
        style={{ background: '#FFFFFF', border: '1px solid #E0DDD6', boxShadow: '0 8px 40px rgba(26,26,20,.12)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#A8A89C] hover:text-[#1A1A14] transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Heading */}
        <h2
          className="text-lg text-[#1A1A14] mb-1"
          style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400 }}
        >
          QR Code
        </h2>
        <p
          className="text-xs text-[#A8A89C] mb-5 truncate"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {shortUrl}
        </p>

        {/* Visible QR — SVG, light bg */}
        <div className="flex justify-center mb-5">
          <div
            className="rounded-xl p-4"
            style={{ background: '#F9F8F5', border: '1px solid #E0DDD6' }}
          >
            <QRCodeSVG
              value={shortUrl}
              size={200}
              bgColor="transparent"
              fgColor="#1A1A14"
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
