import { useQuery } from '@tanstack/react-query'
import { Trophy, Medal, Flame } from 'lucide-react'
import { leaderboardAPI } from '../lib/api'
import useAuthStore from '../store/authStore'

const medalColors = ['#ffd700', '#c0c0c0', '#cd7f32']

export default function LeaderboardPage() {
  const { user } = useAuthStore()
  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => leaderboardAPI.getLeaderboard({ limit: 30 }).then(r => r.data),
    staleTime: 5 * 60 * 1000,
  })

  const leaderboard = data?.leaderboard || []

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">🏆 Leaderboard</h1>
        <p className="page-subtitle">Top coders ranked by weighted problem score</p>
      </div>

      {/* Scoring info */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div className="flex items-center gap-4" style={{ flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Score = </span>
          <span className="badge badge-easy">Easy × 1</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>+</span>
          <span className="badge badge-medium">Medium × 2</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>+</span>
          <span className="badge badge-hard">Hard × 3</span>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} className="skeleton" style={{ height: 72, borderRadius: 'var(--radius-md)' }} />
          ))}
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏆</div>
          <h3>No rankings yet</h3>
          <p>Add your platform handles and refresh your stats to appear on the leaderboard.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {leaderboard.map((entry, idx) => {
            const isMe = entry.username === user?.username
            return (
              <div
                key={entry.username}
                className="card card-sm"
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '1rem',
                  borderColor: isMe ? 'var(--border-active)' : undefined,
                  background: isMe ? 'rgba(124,58,237,0.05)' : undefined,
                  animation: `fadeIn 0.3s ease ${idx * 0.04}s both`,
                }}
              >
                {/* Rank */}
                <div style={{ width: 36, height: 36, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {idx < 3 ? (
                    <Medal size={22} color={medalColors[idx]} />
                  ) : (
                    <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.9rem' }}>#{entry.rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', background: 'var(--grad-1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.9rem', fontWeight: 700, color: 'white', flexShrink: 0,
                }}>
                  {entry.username[0].toUpperCase()}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-center gap-2">
                    <span style={{ fontWeight: 700 }}>{entry.username}</span>
                    {isMe && <span className="badge badge-accent" style={{ fontSize: '0.7rem' }}>You</span>}
                  </div>
                  <div className="flex items-center gap-2" style={{ marginTop: '0.2rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-easy" style={{ padding: '0.1rem 0.4rem', fontSize: '0.7rem' }}>E:{entry.easySolved}</span>
                    <span className="badge badge-medium" style={{ padding: '0.1rem 0.4rem', fontSize: '0.7rem' }}>M:{entry.mediumSolved}</span>
                    <span className="badge badge-hard" style={{ padding: '0.1rem 0.4rem', fontSize: '0.7rem' }}>H:{entry.hardSolved}</span>
                    {entry.streak > 0 && (
                      <span className="flex items-center gap-1" style={{ fontSize: '0.72rem', color: 'var(--medium)' }}>
                        <Flame size={11} /> {entry.streak}d
                      </span>
                    )}
                  </div>
                </div>

                {/* Score */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem' }} className="gradient-text">{entry.score}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{entry.totalSolved} solved</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
