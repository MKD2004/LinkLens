import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/axios'
import AnimatedSphere from '../components/landing/AnimatedSphere'
import AnimatedTetrahedron from '../components/landing/AnimatedTetrahedron'
import AnimatedWave from '../components/landing/AnimatedWave'

// ── Shared helpers ──────────────────────────────────────────────────────────

function useVisible(threshold = 0.1) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [threshold])
  return [ref, isVisible]
}

const BG = '#F9F8F5'
const FG = '#1A1A14'
const MUTED = '#6B6B5E'
const BORDER = 'rgba(26,26,20,0.12)'

// ── Nav ─────────────────────────────────────────────────────────────────────

const navLinks = [
  { name: 'Features',     href: '#features' },
  { name: 'How it works', href: '#how-it-works' },
  { name: 'Analytics',    href: '#analytics-preview' },
]

function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <header
      className={`fixed z-50 transition-all duration-500 ${
        scrolled ? 'top-4 left-4 right-4' : 'top-0 left-0 right-0'
      }`}
    >
      <nav
        className={`mx-auto transition-all duration-500 ${
          scrolled || open
            ? 'rounded-2xl shadow-lg max-w-[1200px]'
            : 'max-w-[1400px]'
        }`}
        style={{
          background: scrolled || open ? 'rgba(249,248,245,0.85)' : 'transparent',
          backdropFilter: scrolled || open ? 'blur(20px)' : 'none',
          border: scrolled || open ? `1px solid ${BORDER}` : 'none',
        }}
      >
        <div
          className={`flex items-center justify-between px-6 lg:px-8 transition-all duration-500 ${
            scrolled ? 'h-14' : 'h-20'
          }`}
        >
          <a href="#" className="flex items-center gap-1">
            <span
              className={`ll-display tracking-tight transition-all duration-500 ${scrolled ? 'text-xl' : 'text-2xl'}`}
              style={{ color: FG }}
            >
              Link
            </span>
            <span
              className={`ll-display tracking-tight transition-all duration-500 ${scrolled ? 'text-xl' : 'text-2xl'}`}
              style={{ color: '#FF6B2B' }}
            >
              Lens
            </span>
            <span className="ll-mono text-[10px] ml-1" style={{ color: MUTED }}>™</span>
          </a>

          <div className="hidden md:flex items-center gap-12">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm relative group transition-colors duration-300"
                style={{ color: `${FG}B3` }}
                onMouseEnter={e => e.currentTarget.style.color = FG}
                onMouseLeave={e => e.currentTarget.style.color = `${FG}B3`}
              >
                {link.name}
                <span
                  className="absolute -bottom-1 left-0 w-0 h-px transition-all duration-300 group-hover:w-full"
                  style={{ background: FG }}
                />
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/login"
              className={`transition-all duration-500 ${scrolled ? 'text-xs' : 'text-sm'}`}
              style={{ color: `${FG}B3` }}
            >
              Sign in
            </Link>
            <Link
              to="/login"
              className={`rounded-full font-medium transition-all duration-500 ${scrolled ? 'px-4 py-1.5 text-xs' : 'px-6 py-2 text-sm'}`}
              style={{ background: FG, color: BG }}
            >
              Start free
            </Link>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2"
            aria-label="Toggle menu"
          >
            {open ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition-all duration-500 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ background: BG, top: 0 }}
      >
        <div className="flex flex-col h-full px-8 pt-28 pb-8">
          <div className="flex-1 flex flex-col justify-center gap-8">
            {navLinks.map((link, i) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`text-5xl ll-display transition-all duration-500 ${
                  open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ color: FG, transitionDelay: open ? `${i * 75}ms` : '0ms' }}
              >
                {link.name}
              </a>
            ))}
          </div>
          <div
            className={`flex gap-4 pt-8 border-t transition-all duration-500 ${
              open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ borderColor: BORDER, transitionDelay: open ? '300ms' : '0ms' }}
          >
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-full h-14 text-base flex items-center justify-center border"
              style={{ borderColor: BORDER, color: FG }}
            >
              Sign in
            </Link>
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-full h-14 text-base flex items-center justify-center"
              style={{ background: FG, color: BG }}
            >
              Start free
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

// ── Hero ─────────────────────────────────────────────────────────────────────

const heroWords = ['shorten', 'track', 'share', 'analyze']
const heroStats = [
  { value: '10M+',  label: 'links shortened',   company: 'GLOBALLY' },
  { value: '99.9%', label: 'redirect uptime',   company: 'SLA' },
  { value: '12ms',  label: 'avg redirect time', company: 'P99' },
  { value: '140+',  label: 'countries tracked', company: 'ANALYTICS' },
]

function Hero() {
  const [visible, setVisible] = useState(false)
  const [wordIdx, setWordIdx] = useState(0)
  const [url, setUrl] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => { setVisible(true) }, [])

  useEffect(() => {
    const t = setInterval(() => setWordIdx(i => (i + 1) % heroWords.length), 2500)
    return () => clearInterval(t)
  }, [])

  async function handleShorten(e) {
    e.preventDefault()
    setFormError('')
    let trimmed = url.trim()
    if (!trimmed) return
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) trimmed = 'https://' + trimmed
    setLoading(true)
    try {
      const { data } = await api.post('/api/links', { url: trimmed })
      setResult(data)
    } catch (err) {
      const d = err.response?.data
      setFormError(d?.errors?.[0] || d?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(result.shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Sphere */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] lg:w-[800px] lg:h-[800px] opacity-40 pointer-events-none">
        <AnimatedSphere />
      </div>

      {/* Grid lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        {[...Array(8)].map((_, i) => (
          <div key={`h-${i}`} className="absolute h-px" style={{ background: `${FG}1A`, top: `${12.5 * (i + 1)}%`, left: 0, right: 0 }} />
        ))}
        {[...Array(12)].map((_, i) => (
          <div key={`v-${i}`} className="absolute w-px" style={{ background: `${FG}1A`, left: `${8.33 * (i + 1)}%`, top: 0, bottom: 0 }} />
        ))}
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 py-32 lg:py-40">
        {/* Eyebrow */}
        <div className={`mb-8 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <span className="inline-flex items-center gap-3 text-sm ll-mono" style={{ color: MUTED }}>
            <span className="w-8 h-px" style={{ background: `${FG}4D` }} />
            The link shortener for modern teams
          </span>
        </div>

        {/* Headline */}
        <div className="mb-12">
          <h1
            className={`ll-display leading-[0.9] tracking-tight transition-all duration-1000 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ fontSize: 'clamp(3rem,12vw,10rem)', color: FG }}
          >
            <span className="block">Your links,</span>
            <span className="block">
              under a{' '}
              <span className="relative inline-block">
                <span key={wordIdx} className="inline-flex">
                  {heroWords[wordIdx].split('').map((char, i) => (
                    <span
                      key={`${wordIdx}-${i}`}
                      className="ll-char-in inline-block"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      {char}
                    </span>
                  ))}
                </span>
                <span className="absolute -bottom-2 left-0 right-0 h-3" style={{ background: `${FG}1A` }} />
              </span>
            </span>
          </h1>
        </div>

        {/* Description + CTAs */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-end">
          <div>
            <p
              className={`text-xl lg:text-2xl leading-relaxed max-w-xl mb-8 transition-all duration-700 delay-200 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ color: MUTED }}
            >
              Paste any URL and get a clean, trackable short link in seconds.
              Watch every click arrive live.
            </p>

            <div
              className={`flex flex-col sm:flex-row items-start gap-4 mb-8 transition-all duration-700 delay-300 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full px-8 h-14 text-base font-medium group"
                style={{ background: FG, color: BG }}
              >
                Start shortening
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center rounded-full px-8 h-14 text-base border"
                style={{ borderColor: `${FG}33`, color: FG }}
              >
                See how it works
              </a>
            </div>

            {/* Mini shorten form */}
            <div
              className={`transition-all duration-700 delay-400 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              {!result ? (
                <form onSubmit={handleShorten} className="flex gap-2 max-w-md">
                  <input
                    type="text"
                    placeholder="Paste a long URL..."
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    className="flex-1 px-4 py-3 text-sm rounded-full outline-none"
                    style={{
                      background: `${FG}08`,
                      border: `1px solid ${BORDER}`,
                      color: FG,
                    }}
                  />
                  <button
                    type="submit"
                    disabled={loading || !url.trim()}
                    className="px-6 py-3 text-sm rounded-full font-medium disabled:opacity-50"
                    style={{ background: FG, color: BG }}
                  >
                    {loading ? '...' : 'Shorten'}
                  </button>
                </form>
              ) : (
                <div
                  className="flex items-center gap-3 rounded-xl px-4 py-3 max-w-md"
                  style={{ background: `${FG}06`, border: `1px solid ${BORDER}` }}
                >
                  <span className="ll-mono text-sm flex-1 truncate" style={{ color: FG }}>
                    {result.shortUrl}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="shrink-0 px-3 py-1.5 text-xs rounded-full font-medium"
                    style={{ background: FG, color: BG }}
                  >
                    {copied ? '✓' : 'Copy'}
                  </button>
                  <button
                    onClick={() => { setResult(null); setUrl('') }}
                    className="shrink-0 text-xs"
                    style={{ color: MUTED }}
                  >
                    New
                  </button>
                </div>
              )}
              {formError && (
                <p className="mt-2 text-xs ll-mono" style={{ color: '#E53E3E' }}>{formError}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats marquee */}
      <div
        className={`absolute bottom-24 left-0 right-0 overflow-hidden transition-all duration-700 delay-500 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex gap-16 ll-marquee whitespace-nowrap">
          {[0, 1].map((i) => (
            <div key={i} className="flex gap-16">
              {heroStats.map((stat) => (
                <div key={`${stat.company}-${i}`} className="flex items-baseline gap-4">
                  <span className="ll-display" style={{ fontSize: 'clamp(2rem,4vw,3rem)', color: FG }}>
                    {stat.value}
                  </span>
                  <span className="text-sm" style={{ color: MUTED }}>
                    {stat.label}
                    <span className="block ll-mono text-xs mt-1">{stat.company}</span>
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Features ──────────────────────────────────────────────────────────────────

function ShortenVisual() {
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full" style={{ color: FG }}>
      <defs><clipPath id="sClip"><rect x="30" y="20" width="140" height="120" rx="4" /></clipPath></defs>
      <rect x="30" y="20" width="140" height="120" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <g clipPath="url(#sClip)">
        {[0,1,2,3,4,5].map(i => (
          <rect key={i} x="40" y={35 + i * 16} width="120" height="10" rx="2" fill="currentColor" opacity="0.15">
            <animate attributeName="opacity" values="0.15;0.8;0.15" dur="2s" begin={`${i * 0.15}s`} repeatCount="indefinite" />
            <animate attributeName="width" values="20;120;20" dur="2s" begin={`${i * 0.15}s`} repeatCount="indefinite" />
          </rect>
        ))}
      </g>
      <circle cx="100" cy="155" r="3" fill="currentColor" opacity="0.3">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

function AnalyticsVisual() {
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full" style={{ color: FG }}>
      <circle cx="100" cy="80" r="12" fill="currentColor">
        <animate attributeName="r" values="12;14;12" dur="2s" repeatCount="indefinite" />
      </circle>
      {[0,1,2,3,4,5].map(i => {
        const angle = (i * 60) * (Math.PI / 180)
        const r = 50
        return (
          <g key={i}>
            <line x1="100" y1="80" x2={100 + Math.cos(angle) * r} y2={80 + Math.sin(angle) * r}
              stroke="currentColor" strokeWidth="1" opacity="0.3">
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
            </line>
            <circle cx={100 + Math.cos(angle) * r} cy={80 + Math.sin(angle) * r} r="6"
              fill="none" stroke="currentColor" strokeWidth="2">
              <animate attributeName="r" values="6;8;6" dur="2s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
            </circle>
          </g>
        )
      })}
      <circle cx="100" cy="80" r="30" fill="none" stroke="currentColor" strokeWidth="1" opacity="0">
        <animate attributeName="r" values="20;60" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;0" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

function AliasVisual() {
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full" style={{ color: FG }}>
      <g>
        <rect x="30" y="50" width="50" height="60" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
        <text x="55" y="85" textAnchor="middle" fontSize="20" fontFamily="monospace" fill="currentColor">A</text>
        <circle cx="55" cy="35" r="12" fill="none" stroke="currentColor" strokeWidth="2" />
      </g>
      <g>
        <rect x="120" y="50" width="50" height="60" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
        <text x="145" y="85" textAnchor="middle" fontSize="20" fontFamily="monospace" fill="currentColor">B</text>
        <circle cx="145" cy="35" r="12" fill="none" stroke="currentColor" strokeWidth="2" />
      </g>
      <line x1="80" y1="80" x2="120" y2="80" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4">
        <animate attributeName="stroke-dashoffset" values="0;-8" dur="0.5s" repeatCount="indefinite" />
      </line>
      <circle r="4" fill="currentColor">
        <animateMotion dur="1.5s" repeatCount="indefinite"><mpath href="#aliasPath" /></animateMotion>
      </circle>
      <path id="aliasPath" d="M 80 80 L 120 80" fill="none" />
      <g transform="translate(100, 130)">
        <circle r="6" fill="none" stroke="currentColor" strokeWidth="2">
          <animate attributeName="r" values="6;10;6" dur="1s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
        </circle>
      </g>
    </svg>
  )
}

function QRVisual() {
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full" style={{ color: FG }}>
      <path d="M 100 20 L 150 40 L 150 90 Q 150 130 100 145 Q 50 130 50 90 L 50 40 Z"
        fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M 100 35 L 135 50 L 135 85 Q 135 115 100 128 Q 65 115 65 85 L 65 50 Z"
        fill="currentColor" opacity="0.1">
        <animate attributeName="opacity" values="0.1;0.2;0.1" dur="2s" repeatCount="indefinite" />
      </path>
      <rect x="85" y="70" width="30" height="25" rx="3" fill="currentColor" />
      <path d="M 90 70 L 90 60 Q 90 50 100 50 Q 110 50 110 60 L 110 70"
        fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="100" cy="80" r="4" fill={BG} />
      <rect x="98" y="82" width="4" height="8" fill={BG} />
      <line x1="60" y1="60" x2="140" y2="60" stroke="currentColor" strokeWidth="1" opacity="0">
        <animate attributeName="y1" values="40;120;40" dur="3s" repeatCount="indefinite" />
        <animate attributeName="y2" values="40;120;40" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0;0.5;0" dur="3s" repeatCount="indefinite" />
      </line>
    </svg>
  )
}

const features = [
  { number: '01', title: 'Instant Link Shortening', description: 'Paste any URL and get a clean, memorable short link in milliseconds. Supports custom aliases for branded links.', visual: 'shorten' },
  { number: '02', title: 'Real-time Analytics', description: 'Watch every click arrive live. Track by country, device, referrer, and time — with a streaming SSE connection.', visual: 'analytics' },
  { number: '03', title: 'Custom Aliases', description: "Make links that stick. /product-launch, /team-deck, /demo — clean URLs that tell a story before they're clicked.", visual: 'alias' },
  { number: '04', title: 'QR Code Export', description: 'Every short link ships with a scannable QR code. Download as high-res PNG in one click, sized for print or screen.', visual: 'qr' },
]

function FeatureVisual({ type }) {
  if (type === 'shorten') return <ShortenVisual />
  if (type === 'analytics') return <AnalyticsVisual />
  if (type === 'alias') return <AliasVisual />
  return <QRVisual />
}

function FeatureRow({ feature, index }) {
  const [ref, visible] = useVisible(0.2)
  return (
    <div
      ref={ref}
      className={`group transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 py-12 lg:py-20 border-b" style={{ borderColor: BORDER }}>
        <div className="shrink-0">
          <span className="ll-mono text-sm" style={{ color: MUTED }}>{feature.number}</span>
        </div>
        <div className="flex-1 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="ll-display text-3xl lg:text-4xl mb-4 transition-transform duration-500 group-hover:translate-x-2" style={{ color: FG }}>
              {feature.title}
            </h3>
            <p className="text-lg leading-relaxed" style={{ color: MUTED }}>
              {feature.description}
            </p>
          </div>
          <div className="flex justify-center lg:justify-end">
            <div className="w-48 h-40">
              <FeatureVisual type={feature.visual} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeaturesSection() {
  const [ref, visible] = useVisible(0.1)
  return (
    <section id="features" ref={ref} className="relative py-24 lg:py-32">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="mb-16 lg:mb-24">
          <span className="inline-flex items-center gap-3 text-sm ll-mono mb-6" style={{ color: MUTED }}>
            <span className="w-8 h-px" style={{ background: `${FG}4D` }} />
            Capabilities
          </span>
          <h2
            className={`ll-display text-4xl lg:text-6xl tracking-tight transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ color: FG }}
          >
            Everything you need.
            <br />
            <span style={{ color: MUTED }}>Nothing you don&apos;t.</span>
          </h2>
        </div>
        <div>
          {features.map((f, i) => <FeatureRow key={f.number} feature={f} index={i} />)}
        </div>
      </div>
    </section>
  )
}

// ── How it works ──────────────────────────────────────────────────────────────

const steps = [
  {
    number: 'I',
    title: 'Paste your URL',
    description: 'Drop any long URL into the box. Add an optional custom alias, or let us generate a clean short code.',
    code: `linklens.shorten({
  url: 'https://docs.example.com/v2/...',
  alias: 'docs-v2' // optional
})`,
  },
  {
    number: 'II',
    title: 'Get your short link',
    description: 'Receive a clean, trackable short URL instantly. Copy it, share it, or scan the QR code.',
    code: `{
  shortUrl: 'https://lns.to/docs-v2',
  shortId: 'docs-v2',
  qrCode: true,
  createdAt: '2025-06-29'
}`,
  },
  {
    number: 'III',
    title: 'Watch clicks arrive live',
    description: 'Open Analytics and watch every click stream in via real-time SSE. Filter by country, device, or referrer.',
    code: `linklens.analytics('docs-v2', {
  live: true   // server-sent events
  // clicks: [{ country:'IN', device:'mobile' }]
  // totalClicks: 142
})`,
  },
]

function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0)
  const [ref, visible] = useVisible(0.1)

  useEffect(() => {
    const t = setInterval(() => setActiveStep(i => (i + 1) % steps.length), 5000)
    return () => clearInterval(t)
  }, [])

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="relative py-24 lg:py-32 overflow-hidden"
      style={{ background: FG, color: BG }}
    >
      {/* Diagonal lines */}
      <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.03 }}>
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 40px, currentColor 40px, currentColor 41px)`
        }} />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="mb-16 lg:mb-24">
          <span className="inline-flex items-center gap-3 text-sm ll-mono mb-6" style={{ color: `${BG}80` }}>
            <span className="w-8 h-px" style={{ background: `${BG}4D` }} />
            Process
          </span>
          <h2
            className={`ll-display text-4xl lg:text-6xl tracking-tight transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            Three steps.
            <br />
            <span style={{ color: `${BG}80` }}>Infinite possibilities.</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          <div>
            {steps.map((step, i) => (
              <button
                key={step.number}
                type="button"
                onClick={() => setActiveStep(i)}
                className="w-full text-left py-8 border-b transition-all duration-500 group"
                style={{
                  borderColor: `${BG}1A`,
                  opacity: activeStep === i ? 1 : 0.4,
                }}
                onMouseEnter={e => { if (activeStep !== i) e.currentTarget.style.opacity = '0.7' }}
                onMouseLeave={e => { if (activeStep !== i) e.currentTarget.style.opacity = '0.4' }}
              >
                <div className="flex items-start gap-6">
                  <span className="ll-display text-3xl" style={{ color: `${BG}4D` }}>{step.number}</span>
                  <div className="flex-1">
                    <h3 className="ll-display text-2xl lg:text-3xl mb-3 transition-transform duration-300 group-hover:translate-x-2">
                      {step.title}
                    </h3>
                    <p className="leading-relaxed" style={{ color: `${BG}99` }}>{step.description}</p>
                    {activeStep === i && (
                      <div className="ll-step-progress mt-4">
                        <div className="ll-step-progress-bar" />
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Code window */}
          <div className="lg:sticky lg:top-32 self-start">
            <div className="border overflow-hidden" style={{ borderColor: `${BG}1A` }}>
              <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: `${BG}1A` }}>
                <div className="flex gap-2">
                  {[0,1,2].map(i => <div key={i} className="w-3 h-3 rounded-full" style={{ background: `${BG}33` }} />)}
                </div>
                <span className="text-xs ll-mono" style={{ color: `${BG}66` }}>linklens.ts</span>
              </div>
              <div className="p-8 ll-mono text-sm" style={{ minHeight: 280 }}>
                <pre style={{ color: `${BG}B3` }}>
                  {steps[activeStep].code.split('\n').map((line, li) => (
                    <div
                      key={`${activeStep}-${li}`}
                      className="ll-code-line leading-loose"
                      style={{ animationDelay: `${li * 80}ms` }}
                    >
                      <span className="select-none w-8 inline-block" style={{ color: `${BG}33` }}>{li + 1}</span>
                      <span className="inline-flex">
                        {line.split('').map((char, ci) => (
                          <span
                            key={`${activeStep}-${li}-${ci}`}
                            className="ll-code-char"
                            style={{ animationDelay: `${li * 80 + ci * 15}ms` }}
                          >
                            {char === ' ' ? ' ' : char}
                          </span>
                        ))}
                      </span>
                    </div>
                  ))}
                </pre>
              </div>
              <div className="px-6 py-4 border-t flex items-center gap-3" style={{ borderColor: `${BG}1A` }}>
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs ll-mono" style={{ color: `${BG}66` }}>Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Metrics ───────────────────────────────────────────────────────────────────

function AnimatedCounter({ end, suffix = '' }) {
  const [count, setCount] = useState(0)
  const [animated, setAnimated] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated) {
          setAnimated(true)
          const duration = 2000
          const startTime = performance.now()
          const animate = (now) => {
            const elapsed = now - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * end))
            if (progress < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end, animated])

  return (
    <div ref={ref} className="ll-display tracking-tight" style={{ fontSize: 'clamp(3rem,6vw,5rem)', color: FG }}>
      {count.toLocaleString()}{suffix}
    </div>
  )
}

const metrics = [
  { value: 18432, suffix: '',    label: 'Links shortened today' },
  { value: 99,    suffix: '.9%', label: 'Redirect uptime this month' },
  { value: 12,    suffix: 'ms',  label: 'Average redirect time' },
  { value: 140,   suffix: '+',   label: 'Countries with tracked clicks' },
]

function MetricsSection() {
  const [time, setTime] = useState(new Date())
  const [ref, visible] = useVisible(0.1)

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <section id="analytics-preview" ref={ref} className="relative py-24 lg:py-32 border-y" style={{ borderColor: BORDER }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16 lg:mb-24">
          <div>
            <span className="inline-flex items-center gap-3 text-sm ll-mono mb-6" style={{ color: MUTED }}>
              <span className="w-8 h-px" style={{ background: `${FG}4D` }} />
              Live metrics
            </span>
            <h2
              className={`ll-display text-4xl lg:text-6xl tracking-tight transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{ color: FG }}
            >
              Performance you
              <br />
              can measure.
            </h2>
          </div>
          <div className="flex items-center gap-4 ll-mono text-sm" style={{ color: MUTED }}>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live
            </span>
            <span style={{ color: `${FG}4D` }}>|</span>
            <span>{time.toLocaleTimeString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px" style={{ background: BORDER }}>
          {metrics.map((m, i) => (
            <div
              key={m.label}
              className={`p-8 lg:p-12 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ background: BG, transitionDelay: `${i * 100}ms` }}
            >
              <AnimatedCounter end={m.value} suffix={m.suffix} />
              <div className="mt-4 text-lg" style={{ color: MUTED }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


// ── CTA ───────────────────────────────────────────────────────────────────────

function CTASection() {
  const [ref, visible] = useVisible(0.2)
  const [mouse, setMouse] = useState({ x: 50, y: 50 })

  return (
    <section ref={ref} className="relative py-24 lg:py-32 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div
          className={`relative border transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          style={{ borderColor: FG }}
          onMouseMove={e => {
            const r = e.currentTarget.getBoundingClientRect()
            setMouse({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
          }}
        >
          {/* Spotlight */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(600px circle at ${mouse.x}% ${mouse.y}%, rgba(0,0,0,0.06), transparent 40%)` }}
          />

          <div className="relative z-10 px-8 lg:px-16 py-16 lg:py-24">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="flex-1">
                <h2 className="ll-display tracking-tight mb-8 leading-[0.95]" style={{ fontSize: 'clamp(2.5rem,5vw,4.5rem)', color: FG }}>
                  Ready to shorten
                  <br />
                  your first link?
                </h2>
                <p className="text-xl mb-12 leading-relaxed max-w-xl" style={{ color: MUTED }}>
                  Join thousands of teams using LinkLens to shorten, track, and share links at scale. Start free today.
                </p>
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 rounded-full px-8 h-14 text-base font-medium group"
                    style={{ background: FG, color: BG }}
                  >
                    Start shortening free
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  <a
                    href="#"
                    className="inline-flex items-center rounded-full px-8 h-14 text-base border"
                    style={{ borderColor: `${FG}33`, color: FG }}
                  >
                    Talk to us
                  </a>
                </div>
                <p className="text-sm ll-mono mt-8" style={{ color: MUTED }}>No credit card required</p>
              </div>

              <div className="hidden lg:flex items-center justify-center w-[400px] h-[400px] -mr-16">
                <AnimatedTetrahedron />
              </div>
            </div>
          </div>

          {/* Corner decorations */}
          <div className="absolute top-0 right-0 w-32 h-32 border-b border-l" style={{ borderColor: `${FG}1A` }} />
          <div className="absolute bottom-0 left-0 w-32 h-32 border-t border-r" style={{ borderColor: `${FG}1A` }} />
        </div>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────

const footerLinks = {
  Product: [
    { name: 'Features',     href: '#features' },
    { name: 'How it works', href: '#how-it-works' },
    { name: 'Analytics',    href: '#analytics-preview' },
  ],
  Developers: [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'API',       href: '#' },
    { name: 'QR Export', href: '#features' },
    { name: 'Status',    href: '#' },
  ],
  Company: [
    { name: 'About',   href: '#' },
    { name: 'Blog',    href: '#' },
    { name: 'GitHub',  href: 'https://github.com/MKD2004/LinkLens' },
    { name: 'Contact', href: '#' },
  ],
  Legal: [
    { name: 'Privacy', href: '#' },
    { name: 'Terms',   href: '#' },
  ],
}

function Footer() {
  return (
    <footer className="relative border-t" style={{ borderColor: BORDER }}>
      <div className="absolute inset-0 h-64 pointer-events-none overflow-hidden" style={{ opacity: 0.15 }}>
        <AnimatedWave />
      </div>
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="py-16 lg:py-24">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-12 lg:gap-8">
            <div className="col-span-2">
              <a href="#" className="inline-flex items-center gap-1 mb-6">
                <span className="ll-display text-2xl" style={{ color: FG }}>Link</span>
                <span className="ll-display text-2xl" style={{ color: '#FF6B2B' }}>Lens</span>
                <span className="ll-mono text-xs ml-1" style={{ color: MUTED }}>™</span>
              </a>
              <p className="leading-relaxed mb-8 max-w-xs" style={{ color: MUTED }}>
                The link shortener for teams who ship. Shorten, track, and share with real-time analytics.
              </p>
              <div className="flex gap-6">
                {[
                  { name: 'Twitter', href: '#' },
                  { name: 'GitHub', href: 'https://github.com/MKD2004/LinkLens' },
                  { name: 'LinkedIn', href: '#' },
                ].map(link => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-sm flex items-center gap-1 group transition-colors"
                    style={{ color: MUTED }}
                    onMouseEnter={e => e.currentTarget.style.color = FG}
                    onMouseLeave={e => e.currentTarget.style.color = MUTED}
                  >
                    {link.name}
                    <svg className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7v10" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h3 className="text-sm font-medium mb-6" style={{ color: FG }}>{title}</h3>
                <ul className="space-y-4">
                  {links.map(link => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="text-sm transition-colors"
                        style={{ color: MUTED }}
                        onMouseEnter={e => e.currentTarget.style.color = FG}
                        onMouseLeave={e => e.currentTarget.style.color = MUTED}
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="py-8 border-t flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderColor: BORDER }}>
          <p className="text-sm" style={{ color: MUTED }}>2025 LinkLens. All rights reserved.</p>
          <div className="flex items-center gap-2 text-sm" style={{ color: MUTED }}>
            <span className="w-2 h-2 rounded-full bg-green-500" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function Landing() {
  return (
    <div className="ll-landing ll-noise relative min-h-screen overflow-x-hidden">
      <Nav />
      <Hero />
      <FeaturesSection />
      <HowItWorksSection />
      <MetricsSection />
      <CTASection />
      <Footer />
    </div>
  )
}
