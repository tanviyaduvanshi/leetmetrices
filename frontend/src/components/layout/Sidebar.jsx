import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Trophy, GitCompare, Target, Bookmark,
  Settings, LogOut, ChevronRight, Zap, User
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { authAPI } from '../../lib/api'
import toast from 'react-hot-toast'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Trophy, label: 'Leaderboard', path: '/leaderboard' },
  { icon: GitCompare, label: 'Compare', path: '/compare' },
  { icon: Target, label: 'Goals', path: '/goals' },
  { icon: Bookmark, label: 'Bookmarks', path: '/bookmarks' },
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, clearAuth } = useAuthStore()

  const handleLogout = async () => {
    try { await authAPI.logout() } catch (_) {}
    clearAuth()
    navigate('/')
    toast.success('Logged out')
  }

  return (
    <aside className="sidebar">
      <p className="sidebar-section-label">Main</p>
      {navItems.map(({ icon: Icon, label, path }) => (
        <Link
          key={path}
          to={path}
          className={`sidebar-link ${location.pathname === path ? 'active' : ''}`}
        >
          <Icon size={18} />
          {label}
          {location.pathname === path && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
        </Link>
      ))}

      <p className="sidebar-section-label">Account</p>
      <Link
        to="/profile"
        className={`sidebar-link ${location.pathname === '/profile' ? 'active' : ''}`}
      >
        <User size={18} />
        Profile
      </Link>
      <Link
        to="/settings"
        className={`sidebar-link ${location.pathname === '/settings' ? 'active' : ''}`}
      >
        <Settings size={18} />
        Settings
      </Link>

      {/* User info at bottom */}
      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0.75rem', marginBottom: '0.5rem' }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--grad-1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8rem', fontWeight: 700, color: 'white', flexShrink: 0,
          }}>
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.username}
            </p>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </p>
          </div>
        </div>
        <button className="sidebar-link" onClick={handleLogout} style={{ color: 'var(--hard)' }}>
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  )
}
