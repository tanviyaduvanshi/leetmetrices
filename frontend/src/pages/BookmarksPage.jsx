import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bookmark, Trash2, ExternalLink } from 'lucide-react'
import { userAPI } from '../lib/api'
import toast from 'react-hot-toast'

export default function BookmarksPage() {
  const queryClient = useQueryClient()
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userAPI.getProfile().then(r => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: userAPI.removeBookmark,
    onSuccess: () => { queryClient.invalidateQueries(['profile']); toast.success('Bookmark removed') },
  })

  const bookmarks = profile?.user?.bookmarks || []

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Bookmarks 🔖</h1>
        <p className="page-subtitle">Save and organize problems you want to revisit</p>
      </div>

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 'var(--radius-md)' }} />)}
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Bookmark size={48} opacity={0.3} /></div>
          <h3>No bookmarks yet</h3>
          <p>Save problems you want to revisit. Use the API to add bookmarks from any platform.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {bookmarks.map(bm => (
            <div key={bm._id} className="card card-sm" style={{ gap: '0.5rem', display: 'flex', flexDirection: 'column' }}>
              <div className="flex items-center justify-between">
                <span className={`platform-badge platform-${bm.platform === 'leetcode' ? 'lc' : bm.platform === 'codeforces' ? 'cf' : 'cc'}`}>
                  {bm.platform}
                </span>
                {bm.difficulty && <span className={`badge badge-${bm.difficulty.toLowerCase()}`}>{bm.difficulty}</span>}
              </div>
              <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{bm.title}</p>
              {bm.tags?.length > 0 && (
                <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
                  {bm.tags.map((tag, i) => (
                    <span key={i} className="badge badge-cyan" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}>{tag}</span>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2" style={{ marginTop: 'auto' }}>
                {bm.url && (
                  <a href={bm.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{ fontSize: '0.78rem' }}>
                    <ExternalLink size={12} /> Open
                  </a>
                )}
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => deleteMutation.mutate(bm._id)}
                  style={{ marginLeft: 'auto' }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
