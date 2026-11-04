'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import useAuthStore from '@/zustand/useAuthStore'

interface Log {
  _id: string
  createdAt: string
  adminId?: { username: string } | null
  [key: string]: any // other fields from your StaffLogs model
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Local-time key like "2026-11-04"
const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const Member = () => {
  const { getAuthUserFunction } = useAuthStore()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<Log[]>([])
  const [error, setError] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  // Role check (runs once)
  useEffect(() => {
    const checkRole = async () => {
      const userData: any = await getAuthUserFunction()
      if (!userData || userData.role !== 'member') {
        router.replace('/main')
      }
    }
    checkRole()
  }, [router])

  // Fetch logs whenever the visible month changes
  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true)
      setError(null)
      setSelectedDay(null)
      try {
        const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
        const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)

        const params = new URLSearchParams({
          start: start.toISOString(),
          end: end.toISOString(),
        })

        const res = await fetch(`/api/members/get-attendance?${params}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load attendance')

        setLogs(data.logs)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
        setLogs([])
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
  }, [currentMonth])

  // Group logs by local day
  const logsByDay = useMemo(() => {
    const map: Record<string, Log[]> = {}
    logs.forEach((log) => {
      const key = dayKey(new Date(log.createdAt))
        ; (map[key] ||= []).push(log)
    })
    return map
  }, [logs])

  // Build calendar cells (null = empty leading cell)
  const cells = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstWeekday = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const result: (number | null)[] = Array(firstWeekday).fill(null)
    for (let d = 1; d <= daysInMonth; d++) result.push(d)
    return result
  }, [currentMonth])

  const changeMonth = (offset: number) => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1)
    )
  }

  const goToToday = () => {
    const now = new Date()
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1))
  }

  const todayKey = dayKey(new Date())
  const daysAttended = Object.keys(logsByDay).length
  const selectedLogs = selectedDay ? logsByDay[selectedDay] || [] : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-end justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Attendance History</h1>
          <span className="text-sm text-gray-500">
            {daysAttended} {daysAttended === 1 ? 'day' : 'days'} this month
          </span>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>
        )}

        <div className="rounded-xl bg-white p-4 shadow-sm">
          {/* Month navigation */}
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => changeMonth(-1)}
              className="rounded-lg px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
              aria-label="Previous month"
            >
              ←
            </button>

            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900">
                {currentMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </h2>
              <button
                onClick={goToToday}
                className="rounded-md border border-gray-200 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-50"
              >
                Today
              </button>
            </div>

            <button
              onClick={() => changeMonth(1)}
              className="rounded-lg px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
              aria-label="Next month"
            >
              →
            </button>
          </div>

          {/* Weekday header */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-400">
            {WEEKDAYS.map((w) => (
              <div key={w} className="py-1">{w}</div>
            ))}
          </div>

          {/* Day grid */}
          <div className={`mt-1 grid grid-cols-7 gap-1 ${loading ? 'opacity-50' : ''}`}>
            {cells.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} />

              const key = dayKey(
                new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
              )
              const count = logsByDay[key]?.length || 0
              const attended = count > 0
              const isToday = key === todayKey
              const isSelected = key === selectedDay

              return (
                <button
                  key={key}
                  onClick={() => setSelectedDay(key)}
                  className={[
                    'relative flex aspect-square items-center justify-center rounded-lg text-sm transition',
                    attended
                      ? 'bg-green-100 font-semibold text-green-800 hover:bg-green-200'
                      : 'text-gray-700 hover:bg-gray-100',
                    isToday ? 'ring-2 ring-blue-400' : '',
                    isSelected ? 'outline outline-2 outline-gray-900' : '',
                  ].join(' ')}
                >
                  {day}
                  {count > 1 && (
                    <span className="absolute right-1 top-1 text-[10px] text-green-700">
                      ×{count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded bg-green-100" /> Attended
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded ring-2 ring-blue-400" /> Today
            </span>
          </div>
        </div>

        {/* Selected day details */}
        {selectedDay && (
          <div className="mt-4 rounded-xl bg-white p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900">
              {new Date(selectedDay + 'T00:00:00').toLocaleDateString(undefined, {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              })}
            </h3>

            {selectedLogs.length === 0 ? (
              <p className="mt-2 text-sm text-gray-500">No attendance on this day.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {selectedLogs.map((log) => (
                  <li key={log._id} className="rounded-lg bg-gray-50 p-3">
                    <p className="text-sm text-gray-800">
                      {new Date(log.createdAt).toLocaleTimeString([], {
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                    <p className="text-xs text-gray-400">
                      Logged by {log.adminId?.username || 'Unknown'}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Member