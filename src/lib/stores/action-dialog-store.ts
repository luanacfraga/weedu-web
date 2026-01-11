import { create } from 'zustand'

interface ActionDialogState {
  // State
  open: boolean
  actionId: string | null // null = create, string = edit
  mode: 'manual' | 'ai'

  // Actions
  openCreate: () => void
  openEdit: (actionId: string) => void
  close: () => void
  setMode: (mode: 'manual' | 'ai') => void
}

export const useActionDialogStore = create<ActionDialogState>((set) => ({
  open: false,
  actionId: null,
  mode: 'manual',

  openCreate: () => set({ open: true, actionId: null, mode: 'manual' }),
  openEdit: (actionId: string) => set({ open: true, actionId, mode: 'manual' }),
  close: () => set({ open: false, actionId: null, mode: 'manual' }),
  setMode: (mode: 'manual' | 'ai') => set({ mode }),
}))
