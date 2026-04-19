import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../lib/api'

/**
 * Global auth state — persisted in localStorage
 */
const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      /** Set auth state after login/register */
      setAuth: ({ user, token }) => {
        set({ user, token, isAuthenticated: true })
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      },

      /** Clear auth state on logout */
      clearAuth: () => {
        set({ user: null, token: null, isAuthenticated: false })
        delete api.defaults.headers.common['Authorization']
      },

      /** Update user profile in store */
      updateUser: (updates) => {
        set(state => ({ user: { ...state.user, ...updates } }))
      },

      /** Restore token to axios headers on app reload */
      restoreAuth: () => {
        const { token } = get()
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        }
      },
    }),
    {
      name: 'leetmetrices-auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
)

export default useAuthStore
