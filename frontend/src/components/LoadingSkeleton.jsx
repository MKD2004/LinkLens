export function CardSkeleton() {
  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{ background: '#161D2E', border: '1px solid #243049' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-2/5" />
          <div className="skeleton h-3 w-3/5" />
        </div>
        <div className="flex gap-2">
          <div className="skeleton h-5 w-16 rounded-full" />
          <div className="skeleton h-5 w-14 rounded-full" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="skeleton h-3 w-20" />
        <div className="flex gap-2">
          <div className="skeleton h-6 w-12 rounded-lg" />
          <div className="skeleton h-6 w-20 rounded-lg" />
          <div className="skeleton h-6 w-14 rounded-lg" />
          <div className="skeleton h-6 w-16 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: '#161D2E', border: '1px solid #243049' }}
    >
      <div className="skeleton h-3.5 w-36 mb-5" />
      <div className="skeleton h-[220px] rounded-lg" />
    </div>
  )
}

export function StatSkeleton() {
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: '#161D2E', border: '1px solid #243049' }}
    >
      <div className="skeleton h-3 w-20 mb-3" />
      <div className="skeleton h-7 w-16" />
    </div>
  )
}
