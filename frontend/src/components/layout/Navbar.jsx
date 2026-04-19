import { Link, useNavigate } from 'react-router-dom'
import { Bell, RefreshCw, Zap } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { statsAPI } from '../../lib/api'
import toast from 'react-hot-toast'
import { useState } from 'react'

export default function Navbar() {
  const { isAuthenticated, user } = useAuthStore()
  const navigate = useNavigate()
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await statsAPI.refresh()
      toast.success('Stats refreshed!')
      window.location.reload()
    } catch (err) {
      toast.error(err.readableMessage || 'Refresh failed')
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="logo">
          <div className="logo-icon">
            <Zap size={18} color="white" />
          </div>
          <span>Leet</span><em>Metrices</em>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <button
                className="btn btn-ghost btn-sm btn-icon"
                onClick={handleRefresh}
                disabled={refreshing}
                title="Refresh stats"
                style={{ color: 'var(--text-secondary)' }}
              >
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} style={{ animation: refreshing ? 'spin 0.6s linear infinite' : 'none' }} />
              </button>
              <Link to="/profile" className="btn btn-secondary btn-sm">
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: 'var(--grad-1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 700, color: 'white'
                }}>
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                {user?.username}
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
