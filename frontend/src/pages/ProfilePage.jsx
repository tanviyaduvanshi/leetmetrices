import { useQuery } from '@tanstack/react-query'
import { userAPI, statsAPI } from '../lib/api'
import useAuthStore from '../store/authStore'
import Heatmap from '../components/dashboard/Heatmap'
import { DifficultyDonut } from '../components/dashboard/Charts'
import { Calendar, Flame, Code, Trophy, Download } from 'lucide-react'
import html2pdf from 'html2pdf.js'

export default function ProfilePage() {
  const { user } = useAuthStore()
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['myStats'],
    queryFn: () => statsAPI.getMyStats().then(r => r.data),
    staleTime: 5 * 60 * 1000,
  })

  const agg = statsData?.stats?.aggregated || {}
  const platforms = user?.platforms || {}

  const handleExportPDF = () => {
    const element = document.getElementById('profile-export-area')
    if (!element) return
    
    // Temporarily add a class for PDF styling if needed, or just capture
    const opt = {
      margin:       0.5,
      filename:     `${user?.username || 'user'}_leetmetrices_profile.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    }
    
    html2pdf().set(opt).from(element).save()
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Your public coding identity</p>
        </div>
        <button onClick={handleExportPDF} className="btn btn-secondary btn-sm">
          <Download size={16} /> Export PDF
        </button>
      </div>

      <div id="profile-export-area" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem', alignItems: 'start', padding: '0.5rem' }}>
        {/* Left: User info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%', background: 'var(--grad-1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontWeight: 800, color: 'white',
              margin: '0 auto 1rem', boxShadow: 'var(--shadow-glow)',
            }}>
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <h3>{user?.username}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.4rem 0' }}>{user?.email}</p>
            {user?.bio && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{user.bio}</p>}

            {/* Streak */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '1rem' }}>
              <div style={{ background: 'var(--bg-overlay)', borderRadius: 'var(--radius-sm)', padding: '0.6rem' }}>
                <div className="flex items-center justify-center gap-1" style={{ color: 'var(--medium)', fontWeight: 700, fontSize: '1.3rem' }}>
                  <Flame size={16} /> {user?.streak?.current || 0}
                </div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>Current Streak</p>
              </div>
              <div style={{ background: 'var(--bg-overlay)', borderRadius: 'var(--radius-sm)', padding: '0.6rem' }}>
                <div className="flex items-center justify-center gap-1" style={{ color: 'var(--accent-1)', fontWeight: 700, fontSize: '1.3rem' }}>
                  {user?.streak?.longest || 0}
                </div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>Best Streak</p>
              </div>
            </div>
          </div>

          {/* Platform handles */}
          <div className="card">
            <h4 style={{ marginBottom: '0.75rem' }}>Platform Handles</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { key: 'leetcode', label: '🟡 LeetCode', cls: 'platform-lc' },
                { key: 'codeforces', label: '🔵 Codeforces', cls: 'platform-cf' },
                { key: 'codechef', label: '🔶 CodeChef', cls: 'platform-cc' },
              ].map(p => (
                platforms[p.key] ? (
                  <div key={p.key} className="flex items-center justify-between" style={{ padding: '0.5rem', background: 'var(--bg-overlay)', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p.label}</span>
                    <span style={{ fontSize: '0.8rem', fontFamily: 'JetBrains Mono', color: 'var(--text-primary)' }}>{platforms[p.key]}</span>
                  </div>
                ) : (
                  <div key={p.key} style={{ padding: '0.5rem', border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.label} — not connected</span>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>

        {/* Right: Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.75rem' }}>
            {[
              { label: 'Total Solved', value: agg.totalSolved || 0, icon: Code },
              { label: 'Easy', value: agg.easySolved || 0, color: 'var(--easy)', icon: Code },
              { label: 'Medium', value: agg.mediumSolved || 0, color: 'var(--medium)', icon: Code },
              { label: 'Hard', value: agg.hardSolved || 0, color: 'var(--hard)', icon: Code },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <span className="stat-label">{s.label}</span>
                <span className="stat-value" style={s.color ? { background: `linear-gradient(135deg, ${s.color}, ${s.color}aa)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' } : undefined}>
                  {s.value}
                </span>
              </div>
            ))}
          </div>

          <div className="card">
            <h4 style={{ marginBottom: '1rem' }}>Difficulty Distribution</h4>
            {isLoading ? (
              <div className="skeleton" style={{ height: 220, borderRadius: 12 }} />
            ) : (
              <DifficultyDonut easySolved={agg.easySolved} mediumSolved={agg.mediumSolved} hardSolved={agg.hardSolved} />
            )}
          </div>

          <div className="card">
            <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
              <h4>Activity</h4>
              <span className="badge badge-accent">Last 26 weeks</span>
            </div>
            {isLoading ? (
              <div className="skeleton" style={{ height: 100, borderRadius: 8 }} />
            ) : (
              <Heatmap activityCalendar={agg.activityCalendar || {}} weeks={26} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
