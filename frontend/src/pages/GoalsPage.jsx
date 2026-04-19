import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Target, Plus, Trash2, CheckCircle, Calendar } from 'lucide-react'
import { goalsAPI } from '../lib/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const PLATFORMS = ['all', 'leetcode', 'codeforces', 'codechef']
const DIFFICULTIES = ['', 'easy', 'medium', 'hard']

function GoalModal({ onClose, onSave }) {
  const [form, setForm] = useState({ title: '', target: '', platform: 'all', difficulty: '', deadline: '' })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.target) { toast.error('Title and target required'); return }
    setSaving(true)
    try {
      await onSave(form)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-slide-down">
        <div className="modal-header">
          <h3>New Goal</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Goal Title</label>
            <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Solve 300 problems in 3 months" required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Target Count</label>
              <input className="input" type="number" min="1" value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))} placeholder="300" required />
            </div>
            <div className="form-group">
              <label className="form-label">Platform</label>
              <select className="select" value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}>
                {PLATFORMS.map(p => <option key={p} value={p}>{p === 'all' ? 'All Platforms' : p}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Difficulty (optional)</label>
              <select className="select" value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>
                <option value="">Any</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Deadline</label>
              <input className="input" type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1 }}>
              {saving ? 'Saving...' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function GoalCard({ goal, onDelete, onToggle }) {
  const progress = goal.target > 0 ? Math.min((goal.current / goal.target) * 100, 100) : 0
  const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000*60*60*24)) : null

  return (
    <div className={`goal-card ${goal.completed ? 'completed' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {goal.completed ? <CheckCircle size={16} color="var(--easy)" /> : <Target size={16} color="var(--accent-1)" />}
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{goal.title}</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => onToggle(goal._id, !goal.completed)} title={goal.completed ? 'Mark incomplete' : 'Mark complete'}>
            <CheckCircle size={15} color={goal.completed ? 'var(--easy)' : 'var(--text-muted)'} />
          </button>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => onDelete(goal._id)} title="Delete">
            <Trash2 size={14} color="var(--hard)" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
        {goal.platform && goal.platform !== 'all' && <span className="badge badge-accent">{goal.platform}</span>}
        {goal.difficulty && <span className={`badge badge-${goal.difficulty}`}>{goal.difficulty}</span>}
        {daysLeft !== null && (
          <span className="flex items-center gap-1" style={{ fontSize: '0.75rem', color: daysLeft < 7 ? 'var(--hard)' : 'var(--text-muted)' }}>
            <Calendar size={11} /> {daysLeft > 0 ? `${daysLeft}d left` : 'Overdue'}
          </span>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between" style={{ marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{goal.current} / {goal.target}</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: progress >= 100 ? 'var(--easy)' : 'var(--accent-1)' }}>{Math.round(progress)}%</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill progress-accent"
            style={{ width: `${progress}%`, background: progress >= 100 ? 'var(--easy)' : undefined }}
          />
        </div>
      </div>
    </div>
  )
}

export default function GoalsPage() {
  const [showModal, setShowModal] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => goalsAPI.getGoals().then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: goalsAPI.createGoal,
    onSuccess: () => { queryClient.invalidateQueries(['goals']); toast.success('Goal created! 🎯') },
    onError: (err) => toast.error(err.readableMessage || 'Failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: goalsAPI.deleteGoal,
    onSuccess: () => { queryClient.invalidateQueries(['goals']); toast.success('Goal deleted') },
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, completed }) => goalsAPI.updateGoal(id, { completed }),
    onSuccess: () => queryClient.invalidateQueries(['goals']),
  })

  const goals = data?.goals || []
  const active = goals.filter(g => !g.completed)
  const completed = goals.filter(g => g.completed)

  return (
    <div className="animate-fade-in">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Goals 🎯</h1>
          <p className="page-subtitle">Set targets and track your coding milestones</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Goal
        </button>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-md)' }} />)}
        </div>
      ) : (
        <>
          {active.length === 0 && completed.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎯</div>
              <h3>No goals yet</h3>
              <p>Create your first coding goal to stay motivated and track progress.</p>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Create Goal</button>
            </div>
          ) : (
            <>
              {active.length > 0 && (
                <>
                  <h4 style={{ marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>Active Goals ({active.length})</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    {active.map(goal => (
                      <GoalCard
                        key={goal._id}
                        goal={goal}
                        onDelete={(id) => deleteMutation.mutate(id)}
                        onToggle={(id, completed) => toggleMutation.mutate({ id, completed })}
                      />
                    ))}
                  </div>
                </>
              )}
              {completed.length > 0 && (
                <>
                  <h4 style={{ marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>Completed ✓ ({completed.length})</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {completed.map(goal => (
                      <GoalCard
                        key={goal._id}
                        goal={goal}
                        onDelete={(id) => deleteMutation.mutate(id)}
                        onToggle={(id, completed) => toggleMutation.mutate({ id, completed })}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}

      {showModal && (
        <GoalModal
          onClose={() => setShowModal(false)}
          onSave={(data) => createMutation.mutateAsync(data)}
        />
      )}
    </div>
  )
}
