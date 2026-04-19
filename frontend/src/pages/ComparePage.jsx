import { useState } from 'react'
import { GitCompare, Search, ArrowRight } from 'lucide-react'
import { statsAPI } from '../lib/api'
import { DifficultyDonut } from '../components/dashboard/Charts'
import toast from 'react-hot-toast'

const StatRow = ({ label, v1, v2, higherIsBetter = true }) => {
  const winner = higherIsBetter ? (v1 > v2 ? 1 : v1 < v2 ? 2 : 0) : (v1 < v2 ? 1 : v1 > v2 ? 2 : 0)
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.5rem', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ textAlign: 'right', fontWeight: winner === 1 ? 700 : 400, color: winner === 1 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
        {v1 ?? '—'}
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', minWidth: 100 }}>{label}</div>
      <div style={{ fontWeight: winner === 2 ? 700 : 400, color: winner === 2 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
        {v2 ?? '—'}
      </div>
    </div>
  )
}

export default function ComparePage() {
  const [u1, setU1] = useState('')
  const [u2, setU2] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleCompare = async (e) => {
    e.preventDefault()
    if (!u1.trim() || !u2.trim()) { toast.error('Enter both usernames'); return }
    if (u1.trim() === u2.trim()) { toast.error('Enter two different users'); return }
    setLoading(true)
    try {
      const { data: result } = await statsAPI.compare(u1.trim(), u2.trim())
      setData(result)
    } catch (err) {
      toast.error(err.readableMessage || 'Comparison failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">⚔️ Compare Users</h1>
        <p className="page-subtitle">Side-by-side comparison of two coders</p>
      </div>

      {/* Input form */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <form onSubmit={handleCompare} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: 160 }}>
            <label className="form-label">User 1 (LeetMetrices username)</label>
            <input className="input" value={u1} onChange={e => setU1(e.target.value)} placeholder="username1" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', paddingBottom: '0.65rem' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>VS</span>
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: 160 }}>
            <label className="form-label">User 2 (LeetMetrices username)</label>
            <input className="input" value={u2} onChange={e => setU2(e.target.value)} placeholder="username2" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: 'flex-end' }}>
            {loading ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Comparing...</> : <><GitCompare size={16} /> Compare</>}
          </button>
        </form>
      </div>

      {/* Results */}
      {data && (
        <div className="animate-fade-in">
          {/* User headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            {[data.user1, data.user2].map((u, i) => (
              <div key={i} className="card" style={{ textAlign: 'center', borderColor: i === 0 ? 'rgba(124,58,237,0.3)' : 'rgba(6,182,212,0.3)' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', margin: '0 auto 0.75rem',
                  background: i === 0 ? 'var(--grad-1)' : 'linear-gradient(135deg, #06b6d4, #22c55e)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', fontWeight: 800, color: 'white',
                }}>
                  {u.username[0].toUpperCase()}
                </div>
                <h3>{u.username}</h3>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  {u.platforms?.leetcode && <span className="platform-badge platform-lc">LC</span>}
                  {u.platforms?.codeforces && <span className="platform-badge platform-cf">CF</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Stat comparison */}
          <div className="card" style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>Head-to-Head Stats</h4>
            <StatRow label="Total Solved" v1={data.user1.stats?.totalSolved} v2={data.user2.stats?.totalSolved} />
            <StatRow label="Easy Solved" v1={data.user1.stats?.easySolved} v2={data.user2.stats?.easySolved} />
            <StatRow label="Medium Solved" v1={data.user1.stats?.mediumSolved} v2={data.user2.stats?.mediumSolved} />
            <StatRow label="Hard Solved" v1={data.user1.stats?.hardSolved} v2={data.user2.stats?.hardSolved} />
            <StatRow label="Acceptance Rate %" v1={data.user1.stats?.acceptanceRate} v2={data.user2.stats?.acceptanceRate} />
            <StatRow label="CF Rating" v1={data.user1.platformStats?.codeforces?.rating} v2={data.user2.platformStats?.codeforces?.rating} />
            <StatRow label="LeetCode Rating" v1={data.user1.platformStats?.leetcode?.rating} v2={data.user2.platformStats?.leetcode?.rating} />
          </div>

          {/* Donut charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[data.user1, data.user2].map((u, i) => (
              <div key={i} className="card">
                <h4 style={{ marginBottom: '1rem' }}>{u.username} — Difficulty</h4>
                <DifficultyDonut
                  easySolved={u.stats?.easySolved}
                  mediumSolved={u.stats?.mediumSolved}
                  hardSolved={u.stats?.hardSolved}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {!data && !loading && (
        <div className="empty-state">
          <div className="empty-icon"><GitCompare size={48} opacity={0.3} /></div>
          <h3>Compare two LeetMetrices users</h3>
          <p>Enter usernames above to see a detailed side-by-side comparison.</p>
        </div>
      )}
    </div>
  )
}
