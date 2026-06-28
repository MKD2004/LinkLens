export function CardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
        <div className="flex gap-2">
          <div className="h-5 bg-gray-200 rounded-full w-16" />
          <div className="h-5 bg-gray-200 rounded-full w-14" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="h-3 bg-gray-100 rounded w-20" />
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 rounded-md w-12" />
          <div className="h-6 bg-gray-200 rounded-md w-20" />
          <div className="h-6 bg-gray-200 rounded-md w-14" />
          <div className="h-6 bg-gray-200 rounded-md w-16" />
        </div>
      </div>
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-32 mb-4" />
      <div className="h-[300px] bg-gray-100 rounded-lg" />
    </div>
  )
}

export function StatSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
      <div className="h-3 bg-gray-200 rounded w-20 mb-3" />
      <div className="h-7 bg-gray-100 rounded w-16" />
    </div>
  )
}
