import { config } from '@/config'
import Cookies from 'js-cookie'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  name: string
  role: 'master' | 'admin' | 'manager' | 'executor' | 'consultant'
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
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
)
