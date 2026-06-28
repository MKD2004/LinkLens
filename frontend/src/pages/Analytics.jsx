import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Title, Tooltip, Legend,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import api from '../lib/axios'
import { useAuth } from '../contexts/AuthContext'
import useSSE from '../hooks/useSSE'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend)

const BASE_URL = import.meta.env.VITE_API_URL
const INDIGO = '#6366f1'

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
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <p className="text-xs text-gray-400 font-medium mb-1 flex items-center gap-2">
        {label}
        {children}
      </p>
      <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <p className="text-sm font-semibold text-gray-700 mb-4">{title}</p>
      {children}
    </div>
  )
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

  // Merge SSE clicks into byDay data
  const mergedByDay = useMemo(() => {
    if (!analyticsData) return []
    const base = fillDates(analyticsData.byDay)
    if (clicks.length === 0) return base

    const today = new Date().toISOString().slice(0, 10)
    const map = Object.fromEntries(base.map(d => [d.date, d.count]))
    clicks.forEach(() => { map[today] = (map[today] || 0) + 1 })

    // Ensure today is in the range
    if (!map[today]) map[today] = 0
    const allDates = [...new Set([...base.map(d => d.date), today])].sort()
    return allDates.map(date => ({ date, count: map[date] || 0 }))
  }, [analyticsData, clicks])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="space-y-3 w-full max-w-4xl px-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-white border border-gray-200 rounded-xl animate-pulse" />)}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  const { totalClicks, uniqueVisitors, byCountry, byDevice, byReferer } = analyticsData
  const liveTotal = totalClicks + clicks.length
  const maxReferer = byReferer[0]?.count || 1

  const lineData = {
    labels: mergedByDay.map(d => d.date),
    datasets: [{
      label: 'Clicks',
      data: mergedByDay.map(d => d.count),
      borderColor: INDIGO,
      backgroundColor: INDIGO + '20',
      fill: true,
      tension: 0.3,
      pointRadius: 3,
    }],
  }

  const barData = {
    labels: byCountry.map(c => c.country),
    datasets: [{
      label: 'Clicks',
      data: byCountry.map(c => c.count),
      backgroundColor: INDIGO + 'b3',
      borderRadius: 4,
    }],
  }

  const doughnutData = {
    labels: byDevice.map(d => d.device),
    datasets: [{
      data: byDevice.map(d => d.count),
      backgroundColor: ['#6366f1', '#8b5cf6', '#a78bfa'],
      borderWidth: 0,
    }],
  }

  const chartOpts = (title) => ({
    responsive: true,
    plugins: { legend: { display: false }, title: { display: false } },
    scales: { x: { grid: { display: false } }, y: { grid: { color: '#f3f4f6' } } },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700">
            ← Back
          </button>
          <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 min-w-0">
            <span className="text-indigo-600 text-sm font-medium truncate">{shortUrl}</span>
            <button
              onClick={handleCopy}
              className="shrink-0 text-xs px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <SummaryCard label="Total Clicks" value={liveTotal}>
            {connected && (
              <span className="flex items-center gap-1 text-xs text-green-500">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block" />
                Live
              </span>
            )}
          </SummaryCard>
          <SummaryCard label="Unique Visitors" value={uniqueVisitors} />
          <SummaryCard label="Top Country" value={byCountry[0]?.country || 'N/A'} />
          <SummaryCard label="Top Device" value={byDevice[0]?.device || 'N/A'} />
        </div>

        {/* Charts grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartCard title="Clicks over time (30 days)">
            <Line data={lineData} options={chartOpts('Clicks over time')} height={120} />
          </ChartCard>

          <ChartCard title="Top countries">
            <Bar
              data={barData}
              options={{
                ...chartOpts('Countries'),
                indexAxis: 'y',
                plugins: { legend: { display: false } },
                scales: { x: { grid: { color: '#f3f4f6' } }, y: { grid: { display: false } } },
              }}
              height={120}
            />
          </ChartCard>

          <ChartCard title="Device breakdown">
            <div className="flex items-center justify-center">
              <Doughnut
                data={doughnutData}
                options={{ responsive: true, plugins: { legend: { position: 'bottom' } }, cutout: '65%' }}
                height={160}
              />
            </div>
          </ChartCard>

          <ChartCard title="Top referrers">
            {byReferer.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No referrer data yet</p>
            ) : (
              <div className="space-y-2">
                {byReferer.map((r, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-28 truncate shrink-0">{r.referer}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-indigo-500"
                        style={{ width: `${(r.count / maxReferer) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-6 text-right shrink-0">{r.count}</span>
                  </div>
                ))}
              </div>
            )}
          </ChartCard>
        </div>
      </div>
    </div>
  )
}
