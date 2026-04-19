import axios from 'axios'

/**
 * Axios instance with base URL and default config
 */
const ObjectConfig = {
  baseURL: import.meta.env.VITE_API_URL || 'https://leetmetrices-api.onrender.com/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
}
const api = axios.create(ObjectConfig)

// ─── Response interceptor ───────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Something went wrong'
    // Attach a readable message
    error.readableMessage = message
    return Promise.reject(error)
  }
)

// ─── Auth API ───────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
}

// ─── User API ───────────────────────────────────────────────────
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  updatePlatforms: (data) => api.put('/users/platforms', data),
  getPublicProfile: (username) => api.get(`/users/${username}`),
  addBookmark: (data) => api.post('/users/bookmarks', data),
  removeBookmark: (id) => api.delete(`/users/bookmarks/${id}`),
}

// ─── Stats API ───────────────────────────────────────────────────
export const statsAPI = {
  getMyStats: (forceRefresh = false) => api.get(`/stats/me${forceRefresh ? '?refresh=true' : ''}`),
  getHistory: (params) => api.get('/stats/history', { params }),
  compare: (u1, u2) => api.get(`/stats/compare/${u1}/${u2}`),
  refresh: () => api.post('/stats/refresh'),
}

// ─── Platform API ────────────────────────────────────────────────
export const platformAPI = {
  previewStats: (platform, handle) => api.get(`/platforms/${platform}/${handle}`),
}

// ─── Goals API ───────────────────────────────────────────────────
export const goalsAPI = {
  getGoals: () => api.get('/goals'),
  createGoal: (data) => api.post('/goals', data),
  updateGoal: (id, data) => api.put(`/goals/${id}`, data),
  deleteGoal: (id) => api.delete(`/goals/${id}`),
}

// ─── Leaderboard API ─────────────────────────────────────────────
export const leaderboardAPI = {
  getLeaderboard: (params) => api.get('/leaderboard', { params }),
}

export default api
