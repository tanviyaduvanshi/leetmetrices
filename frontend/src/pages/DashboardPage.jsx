import { useQuery } from '@tanstack/react-query'
import { RefreshCw, Code, Flame, Trophy, Target, TrendingUp, Calendar } from 'lucide-react'
import { statsAPI } from '../lib/api'
import useAuthStore from '../store/authStore'
import { Link } from 'react-router-dom'
import Heatmap from '../components/dashboard/Heatmap'
import { DifficultyDonut, PlatformBar, ProgressLine, AcceptanceDonut } from '../components/dashboard/Charts'
import InsightsPanel from '../components/dashboard/InsightsPanel'

/** Skeleton loader card */
const SkeletonCard = () => (
  <div className="stat-card">
    <div className="skeleton" style={{ height: 16, width: '40%', borderRadius: 4 }} />
    <div className="skeleton" style={{ height: 40, width: '60%', borderRadius: 4, marginTop: 4 }} />
  </div>
)

/** Platform tag */
const PlatformBadge = ({ name, handle, color }) => (
  handle ? (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'var(--bg-overlay)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{name}</span>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontFamily: 'JetBrains Mono' }}>{handle}</span>
    </div>
  ) : null
)

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['myStats'],
    queryFn: () => statsAPI.getMyStats().then(r => r.data),
    staleTime: 5 * 60 * 1000,
  })

  const { data: histData } = useQuery({
    queryKey: ['statsHistory'],
    queryFn: () => statsAPI.getHistory({ days: 30 }).then(r => r.data),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })

  const platforms = user?.platforms || {}
  const hasPlatforms = Object.values(platforms).some(v => v)

  const stats = data?.stats
  const insights = data?.insights
  const agg = stats?.aggregated || {}

  // No platforms added yet
  if (!hasPlatforms) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Your coding progress at a glance</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
          <h3 style={{ marginBottom: '0.5rem' }}>Add your platform handles to get started</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Connect LeetCode, Codeforces, or CodeChef to see your stats.
          </p>
          <Link to="/settings" className="btn btn-primary">Go to Settings</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, <strong style={{ color: 'var(--accent-1)' }}>{user?.username}</strong></p>
        </div>
        <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
          {platforms.leetcode && <PlatformBadge name="LC" handle={platforms.leetcode} color="var(--lc-color)" />}
          {platforms.codeforces && <PlatformBadge name="CF" handle={platforms.codeforces} color="var(--cf-color)" />}
          {platforms.codechef && <PlatformBadge name="CC" handle={platforms.codechef} color="#c8824a" />}
        </div>
      </div>

      {error && (
        <div className="insight-card insight-weakness" style={{ marginBottom: '1.5rem' }}>
          Failed to fetch stats. {error.message}
          <button className="btn btn-sm btn-secondary" onClick={() => refetch()} style={{ marginLeft: 'auto' }}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* ── Top stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {isLoading ? (
          [1,2,3,4].map(i => <SkeletonCard key={i} />)
        ) : (
          <>
            <div className="stat-card animate-fade-in">
              <div className="flex items-center gap-2">
                <Code size={16} color="var(--text-muted)" />
                <span className="stat-label">Total Solved</span>
              </div>
              <div className="stat-value">{agg.totalSolved || 0}</div>
              <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                <span className="badge badge-easy">E:{agg.easySolved||0}</span>
                <span className="badge badge-medium">M:{agg.mediumSolved||0}</span>
                <span className="badge badge-hard">H:{agg.hardSolved||0}</span>
              </div>
            </div>

            <div className="stat-card animate-fade-in animate-fade-in-delay">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} color="var(--text-muted)" />
                <span className="stat-label">Acceptance Rate</span>
              </div>
              <div className="stat-value" style={{ background: 'linear-gradient(135deg, #06b6d4, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {agg.acceptanceRate || 0}%
              </div>
              <span className="stat-sub">{agg.acceptedSubmissions||0} / {agg.totalSubmissions||0} accepted</span>
            </div>

            <div className="stat-card animate-fade-in animate-fade-in-delay-2">
              <div className="flex items-center gap-2">
                <Flame size={16} color="var(--text-muted)" />
                <span className="stat-label">Current Streak</span>
              </div>
              <div className="stat-value" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {user?.streak?.current || 0}
              </div>
              <span className="stat-sub">Best: {user?.streak?.longest || 0} days</span>
            </div>

            <div className="stat-card animate-fade-in animate-fade-in-delay-2">
              <div className="flex items-center gap-2">
                <Trophy size={16} color="var(--text-muted)" />
                <span className="stat-label">CF Rating</span>
              </div>
              <div className="stat-value" style={{ background: 'linear-gradient(135deg, #1890ff, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {stats?.codeforces?.rating || stats?.leetcode?.rating || '—'}
              </div>
              <span className="stat-sub">{stats?.codeforces?.extra?.rank || 'Connect Codeforces'}</span>
            </div>
          </>
        )}
      </div>

      {/* Main content grid */}
      <div className="dashboard-grid">
        {/* Difficulty Donut */}
        <div className="card">
          <h4 style={{ marginBottom: '1rem' }}>Difficulty Breakdown</h4>
          {isLoading ? (
            <div className="skeleton" style={{ height: 220, borderRadius: 12 }} />
          ) : (
            <>
              <DifficultyDonut
                easySolved={agg.easySolved}
                mediumSolved={agg.mediumSolved}
                hardSolved={agg.hardSolved}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginTop: '1rem' }}>
                {[
                  { label: 'Easy', value: agg.easySolved || 0, cls: 'text-easy' },
                  { label: 'Medium', value: agg.mediumSolved || 0, cls: 'text-medium' },
                  { label: 'Hard', value: agg.hardSolved || 0, cls: 'text-hard' },
                ].map(d => (
                  <div key={d.label} style={{ textAlign: 'center', padding: '0.5rem', background: 'var(--bg-overlay)', borderRadius: 'var(--radius-sm)' }}>
                    <p className={d.cls} style={{ fontWeight: 700, fontSize: '1.2rem' }}>{d.value}</p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{d.label}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Platform Breakdown */}
        <div className="card">
          <h4 style={{ marginBottom: '1rem' }}>Platform Breakdown</h4>
          {isLoading ? (
            <div className="skeleton" style={{ height: 240, borderRadius: 12 }} />
          ) : (
            <PlatformBar platformStats={{
              leetcode: stats?.leetcode,
              codeforces: stats?.codeforces,
              codechef: stats?.codechef,
            }} />
          )}
        </div>
      </div>

      {/* Progress over time + Acceptance rate */}
      <div className="dashboard-grid-main">
        <div className="card">
          <h4 style={{ marginBottom: '1rem' }}>Progress Over Time</h4>
          {isLoading ? (
            <div className="skeleton" style={{ height: 240, borderRadius: 12 }} />
          ) : (
            <ProgressLine snapshots={histData?.snapshots || []} />
          )}
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h4 style={{ marginBottom: '1rem', alignSelf: 'flex-start' }}>Acceptance Rate</h4>
          {isLoading ? (
            <div className="skeleton" style={{ height: 140, width: 140, borderRadius: '50%' }} />
          ) : (
            <AcceptanceDonut acceptanceRate={agg.acceptanceRate} />
          )}
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{agg.totalSubmissions || 0} total submissions</p>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
          <h4>Activity Heatmap</h4>
          <span className="badge badge-accent">Last 26 weeks</span>
        </div>
        {isLoading ? (
          <div className="skeleton" style={{ height: 100, borderRadius: 8 }} />
        ) : (
          <Heatmap activityCalendar={agg.activityCalendar || {}} weeks={26} />
        )}
      </div>

      {/* AI Insights */}
      <div className="card">
        <div className="flex items-center gap-2" style={{ marginBottom: '1rem' }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.9rem' }}>🤖</span>
          </div>
          <h4>AI Insights & Recommendations</h4>
        </div>
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 44, borderRadius: 8 }} />)}
          </div>
        ) : (
          <InsightsPanel insights={insights} />
        )}
      </div>
    </div>
  )
}
