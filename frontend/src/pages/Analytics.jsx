import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import api from '../lib/axios'
import { useAuth } from '../contexts/AuthContext'
import useSSE from '../hooks/useSSE'
import { StatSkeleton, ChartSkeleton } from '../components/LoadingSkeleton'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler)

const BASE_URL = import.meta.env.VITE_API_URL
const DARK = '#1A1A14'

function fillDates(byDay) {
  if (!byDay || byDay.length === 0) return []
  const map = Object.fromEntries(byDay.map(d => [d.date, d.count]))
  const start = new Date(byDay[0].date)
  const end = new Date(byDay[byDay.length - 1].date)
  const result = []
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10)
    result.push({ date: key, count: map[key] || 0 })
  }
  return result
}

function SummaryCard({ label, value, children }) {
  return (
    <div
      className="rounded-xl p-4 card-hover"
      style={{ background: '#FFFFFF', border: '1px solid #E0DDD6', boxShadow: '0 1px 6px rgba(26,26,20,.04)' }}
    >
      <p className="text-xs text-[#A8A89C] font-medium mb-1 flex items-center gap-2 uppercase tracking-wider">
        {label}
        {children}
      </p>
      <p
        className="text-2xl text-[#1A1A14]"
        style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, letterSpacing: '-.01em' }}
      >
        {value ?? '—'}
      </p>
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: '#FFFFFF', border: '1px solid #E0DDD6', boxShadow: '0 1px 6px rgba(26,26,20,.04)' }}
    >
      <p className="text-xs text-[#A8A89C] font-medium uppercase tracking-wider mb-5">{title}</p>
      {children}
    </div>
  )
}

const lightTicks = { color: '#A8A89C', font: { family: 'Instrument Sans', size: 11 } }
const lightBorder = { color: 'transparent' }

function chartOpts() {
  return {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E0DDD6',
        borderWidth: 1,
        titleColor: '#1A1A14',
        bodyColor: '#6B6B5E',
        padding: 10,
        cornerRadius: 8,
        boxShadow: '0 4px 16px rgba(26,26,20,.08)',
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: lightTicks, border: lightBorder },
      y: { grid: { color: 'rgba(224,221,214,.8)' }, ticks: lightTicks, border: lightBorder },
    },
  }
}

export default function Analytics() {
  const { shortId } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  const { clicks, connected } = useSSE(shortId, token)

  useEffect(() => {
    api.get(`/api/links/${shortId}/analytics`)
      .then(({ data }) => setAnalyticsData(data))
      .catch(() => setError('Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [shortId])

  const shortUrl = `${BASE_URL}/r/${shortId}`

  function handleCopy() {
    navigator.clipboard.writeText(shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const mergedByDay = useMemo(() => {
    if (!analyticsData) return []
    const base = fillDates(analyticsData.byDay)
    if (clicks.length === 0) return base
    const today = new Date().toISOString().slice(0, 10)
    const map = Object.fromEntries(base.map(d => [d.date, d.count]))
    clicks.forEach(() => { map[today] = (map[today] || 0) + 1 })
    if (!map[today]) map[today] = 0
    const allDates = [...new Set([...base.map(d => d.date), today])].sort()
    return allDates.map(date => ({ date, count: map[date] || 0 }))
  }, [analyticsData, clicks])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="skeleton h-11 rounded-xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <StatSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <ChartSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto animate-fade-up">
        <div
          className="rounded-xl p-12 text-center"
          style={{ background: '#FFFFFF', border: '1px solid rgba(220,38,38,.12)' }}
        >
          <p className="text-[#1A1A14] font-medium mb-1.5">Failed to load analytics</p>
          <p className="text-[#6B6B5E] text-sm mb-7">{error}</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary px-5 py-2.5 text-sm">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const { totalClicks, uniqueVisitors, byCountry, byDevice, byReferer } = analyticsData
  const liveTotal = totalClicks + clicks.length
  const isEmpty = totalClicks === 0 && clicks.length === 0
  const maxReferer = byReferer[0]?.count || 1

  const lineData = {
    labels: mergedByDay.map(d => d.date),
    datasets: [{
      label: 'Clicks',
      data: mergedByDay.map(d => d.count),
      borderColor: DARK,
      backgroundColor: 'rgba(26,26,20,.06)',
      fill: true,
      tension: 0.35,
      pointRadius: 3,
      pointBackgroundColor: DARK,
      pointBorderColor: '#FFFFFF',
      pointBorderWidth: 2,
    }],
  }

  const barData = {
    labels: byCountry.map(c => c.country),
    datasets: [{
      label: 'Clicks',
      data: byCountry.map(c => c.count),
      backgroundColor: 'rgba(26,26,20,.5)',
      hoverBackgroundColor: DARK,
      borderRadius: 5,
    }],
  }

  const doughnutData = {
    labels: byDevice.map(d => d.device),
    datasets: [{
      data: byDevice.map(d => d.count),
      backgroundColor: ['#1A1A14', '#6B6B5E', '#B0ADA6'],
      borderWidth: 0,
      hoverOffset: 4,
    }],
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-up">

      {/* Header bar */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="btn-ghost shrink-0 px-3 py-2 text-sm rounded-lg">
          ←
        </button>
        <div
          className="flex-1 flex items-center gap-3 rounded-xl px-4 py-2.5 min-w-0"
          style={{ background: '#FFFFFF', border: '1px solid #E0DDD6' }}
        >
          <span className="url-glow text-sm flex-1 min-w-0 truncate">{shortUrl}</span>
          <button onClick={handleCopy} className="btn-primary shrink-0 px-3 py-1.5 text-xs rounded-lg">
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {isEmpty ? (
        <div
          className="rounded-2xl p-14 text-center animate-slide-in"
          style={{ background: '#FFFFFF', border: '1px solid #E0DDD6', boxShadow: '0 2px 16px rgba(26,26,20,.04)' }}
        >
          {connected && (
            <div className="flex items-center justify-center gap-2 text-xs text-[#16A34A] mb-6">
              <span className="live-dot" />
              Live — waiting for first click
            </div>
          )}
          <p
            className="text-lg text-[#1A1A14] mb-2"
            style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400 }}
          >
            No clicks yet
          </p>
          <p className="text-[#6B6B5E] text-sm mb-8">Share your link to start tracking.</p>
          <div
            className="flex items-center gap-3 rounded-xl px-4 py-3 max-w-sm mx-auto"
            style={{ background: 'rgba(3,105,161,.04)', border: '1px solid rgba(3,105,161,.12)' }}
          >
            <span className="url-glow text-sm flex-1 min-w-0 break-all">{shortUrl}</span>
            <button onClick={handleCopy} className="btn-primary shrink-0 px-3 py-1.5 text-xs rounded-lg">
              {copied ? '✓' : 'Copy'}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <SummaryCard label="Total Clicks" value={liveTotal}>
              {connected && (
                <span className="flex items-center gap-1.5 text-xs text-[#16A34A]">
                  <span className="live-dot" />
                  Live
                </span>
              )}
            </SummaryCard>
            <SummaryCard label="Unique Visitors" value={uniqueVisitors} />
            <SummaryCard label="Top Country" value={byCountry[0]?.country || 'N/A'} />
            <SummaryCard label="Top Device" value={byDevice[0]?.device || 'N/A'} />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ChartCard title="Clicks over time — 30 days">
              <Line data={lineData} options={chartOpts()} height={130} />
            </ChartCard>

            <ChartCard title="Top countries">
              <Bar
                data={barData}
                options={{
                  ...chartOpts(),
                  indexAxis: 'y',
                  scales: {
                    x: { grid: { color: 'rgba(224,221,214,.8)' }, ticks: lightTicks, border: lightBorder },
                    y: { grid: { display: false }, ticks: lightTicks, border: lightBorder },
                  },
                }}
                height={130}
              />
            </ChartCard>

            <ChartCard title="Device breakdown">
              <div className="flex items-center justify-center">
                <Doughnut
                  data={doughnutData}
                  options={{
                    responsive: true,
                    cutout: '68%',
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          color: '#6B6B5E',
                          font: { family: 'Instrument Sans', size: 12 },
                          padding: 18,
                          usePointStyle: true,
                          pointStyleWidth: 8,
                        },
                      },
                      tooltip: chartOpts().plugins.tooltip,
                    },
                  }}
                  height={170}
                />
              </div>
            </ChartCard>

            <ChartCard title="Top referrers">
              {byReferer.length === 0 ? (
                <p className="text-[#C4C0B8] text-sm text-center py-10">No referrer data yet</p>
              ) : (
                <div className="space-y-3.5">
                  {byReferer.map((r, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span
                        className="text-xs text-[#6B6B5E] w-28 truncate shrink-0"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {r.referer}
                      </span>
                      <div className="flex-1 rounded-full overflow-hidden" style={{ height: 3, background: '#F3F1EC' }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${(r.count / maxReferer) * 100}%`, background: DARK, transition: 'width .4s ease' }}
                        />
                      </div>
                      <span className="text-xs text-[#A8A89C] w-5 text-right shrink-0 font-mono">{r.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </ChartCard>
          </div>
        </>
      )}
    </div>
  )
}
