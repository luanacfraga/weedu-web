import { config } from '@/config/config'
import { USER_ROLES } from '@/lib/constants'
import type { UserRole } from '@/lib/permissions'
import Cookies from 'js-cookie'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean

  login: (user: User, token: string) => void
  logout: () => void
  setUser: (user: User) => void
  initAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user, token) => {
        Cookies.set(config.cookies.tokenName, token, {
          expires: config.cookies.maxAge,
          sameSite: 'strict',
          secure: process.env.NODE_ENV === 'production',
        })

        set({
          user,
          token,
          isAuthenticated: true,
        })
      },

      logout: () => {
        Cookies.remove(config.cookies.tokenName)

        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },

      setUser: (user) => {
        set({ user })
      },

      initAuth: () => {
        const token = Cookies.get(config.cookies.tokenName)
        if (token) {
          set((state) => {
            if (state.user) {
              return { token, isAuthenticated: true }
            }
            return state
          })
        } else {
          set((state) => {
            if (state.isAuthenticated) {
              return { token: null, isAuthenticated: false }
            }
            return state
          })
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.user !== null,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const token = Cookies.get(config.cookies.tokenName)
          if (token && state.user) {
            state.token = token
            state.isAuthenticated = true
          } else if (!token) {
            state.token = null
            state.isAuthenticated = false
            state.user = null
          }
        }
      },
    }
  )
)
