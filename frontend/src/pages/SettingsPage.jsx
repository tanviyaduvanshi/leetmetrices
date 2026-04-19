import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, User, Link as LinkIcon, Shield, Trash2 } from 'lucide-react'
import { userAPI } from '../lib/api'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

const PLATFORM_FIELDS = [
  { key: 'leetcode', label: 'LeetCode', placeholder: 'e.g. neal_wu', color: 'var(--lc-color)', emoji: '🟡' },
  { key: 'codeforces', label: 'Codeforces', placeholder: 'e.g. tourist', color: 'var(--cf-color)', emoji: '🔵' },
  { key: 'codechef', label: 'CodeChef', placeholder: 'e.g. gennady', color: '#c8824a', emoji: '🔶' },
  { key: 'hackerrank', label: 'HackerRank', placeholder: 'username', color: '#00b86d', emoji: '🟢' },
  { key: 'atcoder', label: 'AtCoder', placeholder: 'username', color: '#9395a5', emoji: '⚪' },
]

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore()
  const navigate = useNavigate()

  const [profileForm, setProfileForm] = useState({ username: user?.username || '', bio: user?.bio || '' })
  const [platformForm, setPlatformForm] = useState({
    leetcode: user?.platforms?.leetcode || '',
    codeforces: user?.platforms?.codeforces || '',
    codechef: user?.platforms?.codechef || '',
    hackerrank: user?.platforms?.hackerrank || '',
    atcoder: user?.platforms?.atcoder || '',
  })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPlatforms, setSavingPlatforms] = useState(false)

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const { data } = await userAPI.updateProfile(profileForm)
      updateUser(data.user)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.readableMessage || 'Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleSavePlatforms = async (e) => {
    e.preventDefault()
    setSavingPlatforms(true)
    try {
      const { data } = await userAPI.updatePlatforms(platformForm)
      updateUser(data.user)
      toast.success('Platform handles saved! Refreshing stats...')
      setTimeout(() => navigate('/dashboard'), 1000)
    } catch (err) {
      toast.error(err.readableMessage || 'Failed to update platforms')
    } finally {
      setSavingPlatforms(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your profile and platform connections</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* Profile */}
        <div className="card">
          <div className="flex items-center gap-2" style={{ marginBottom: '1.5rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={16} color="var(--accent-1)" />
            </div>
            <h3>Profile</h3>
          </div>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--bg-overlay)', borderRadius: 'var(--radius-md)' }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'var(--grad-1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', fontWeight: 800, color: 'white',
              }}>
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.username}</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{user?.email}</p>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Username</label>
              <input className="input" value={profileForm.username}
                onChange={e => setProfileForm(f => ({ ...f, username: e.target.value }))} placeholder="username" />
            </div>

            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea className="textarea" value={profileForm.bio}
                onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))}
                placeholder="Tell us about yourself..." rows={3} />
            </div>

            <button type="submit" className="btn btn-primary" disabled={savingProfile}>
              {savingProfile ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saving...</> : <><Save size={14} /> Save Profile</>}
            </button>
          </form>
        </div>

        {/* Platform Handles */}
        <div className="card">
          <div className="flex items-center gap-2" style={{ marginBottom: '1.5rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(6,182,212,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LinkIcon size={16} color="var(--accent-2)" />
            </div>
            <div>
              <h3>Platform Handles</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Connect your coding profiles</p>
            </div>
          </div>

          <form onSubmit={handleSavePlatforms} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {PLATFORM_FIELDS.map(field => (
              <div key={field.key} className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>{field.emoji}</span>
                  <span style={{ color: field.color }}>{field.label}</span>
                </label>
                <input
                  className="input"
                  value={platformForm[field.key]}
                  onChange={e => setPlatformForm(f => ({ ...f, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  style={{ fontFamily: 'JetBrains Mono', fontSize: '0.85rem' }}
                />
              </div>
            ))}

            <button type="submit" className="btn btn-primary" disabled={savingPlatforms}>
              {savingPlatforms ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saving & Fetching...</> : <><Save size={14} /> Save & Refresh Stats</>}
            </button>
          </form>
        </div>
      </div>

      {/* Danger zone */}
      <div className="card" style={{ marginTop: '1.5rem', borderColor: 'rgba(239,68,68,0.2)' }}>
        <div className="flex items-center gap-2" style={{ marginBottom: '1rem' }}>
          <Shield size={18} color="var(--hard)" />
          <h4 style={{ color: 'var(--hard)' }}>Danger Zone</h4>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          These actions are irreversible. Please be certain.
        </p>
        <button className="btn btn-danger btn-sm">
          <Trash2 size={14} /> Delete Account
        </button>
      </div>
    </div>
  )
}
