import { useMemo } from 'react'
import { format, parseISO, eachDayOfInterval, addDays, subDays, getDay } from 'date-fns'

/**
 * Submission heatmap — similar to GitHub/LeetCode calendar
 * @param {Object} activityCalendar - { unixTimestamp: count }
 * @param {number} weeks - number of weeks to show
 */
export default function Heatmap({ activityCalendar = {}, weeks = 26 }) {
  const { days, maxCount } = useMemo(() => {
    const today = new Date()
    const start = subDays(today, weeks * 7 - 1)

    // Build array of all days
    const allDays = eachDayOfInterval({ start, end: today })
    const days = allDays.map(day => {
      const ts = Math.floor(day.getTime() / 1000)
      // Search nearby timestamps (±43200s = 12h) for submission data
      let count = 0
      Object.entries(activityCalendar).forEach(([key, val]) => {
        const diff = Math.abs(parseInt(key) - ts)
        if (diff < 86400) count += val
      })
      return { date: day, count }
    })

    const maxCount = Math.max(...days.map(d => d.count), 1)
    return { days, maxCount }
  }, [activityCalendar, weeks])

  const getLevel = (count) => {
    if (count === 0) return 0
    if (count <= maxCount * 0.25) return 1
    if (count <= maxCount * 0.5) return 2
    if (count <= maxCount * 0.75) return 3
    return 4
  }

  // Group days into weeks (columns)
  const weekGroups = useMemo(() => {
    const groups = []
    let week = []
    days.forEach((day, i) => {
      week.push(day)
      if (week.length === 7 || i === days.length - 1) {
        groups.push(week)
        week = []
      }
    })
    return groups
  }, [days])

  const today = new Date()
  const months = useMemo(() => {
    const seen = new Set()
    return days.filter(d => {
      const m = format(d.date, 'MMM')
      if (!seen.has(m)) { seen.add(m); return true; }
      return false
    }).map(d => ({ label: format(d.date, 'MMM'), date: d.date }))
  }, [days])

  const totalActive = days.filter(d => d.count > 0).length
  const totalSubmissions = days.reduce((a, d) => a + d.count, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {totalSubmissions} submissions · {totalActive} active days in last {weeks} weeks
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>Less</span>
          {[0,1,2,3,4].map(l => (
            <div key={l} className="heatmap-cell" data-level={l} style={{ flexShrink: 0 }} />
          ))}
          <span>More</span>
        </div>
      </div>

      <div style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <div className="heatmap-grid">
          {weekGroups.map((week, wi) => (
            <div key={wi} className="heatmap-week">
              {week.map((day, di) => {
                const level = getLevel(day.count)
                const isToday = format(day.date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
                return (
                  <div
                    key={di}
                    className={`heatmap-cell ${isToday ? 'today' : ''}`}
                    data-level={level}
                    data-tooltip={`${format(day.date, 'MMM d, yyyy')}: ${day.count} submissions`}
                    title={`${format(day.date, 'MMM d, yyyy')}: ${day.count} submissions`}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
