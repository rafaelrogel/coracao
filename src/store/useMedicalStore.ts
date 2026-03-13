import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MedicalState, HistoryEntry } from '@/types/medical'

const HISTORY_KEY = 'cardioview-history'

export const useMedicalStore = create<MedicalState>()(
  persist(
    (set, get) => ({
      diagnosis: null,
      history: [],
      isLoading: false,
      error: null,
      inputText: '',
      cameraTarget: [0, 0, 0],
      isFullscreen: false,
      isPresentationMode: false,
      showHistory: false,
      modelType: 'procedural',

      setDiagnosis: (diagnosis) => set({ diagnosis, error: null }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error, isLoading: false }),
      setInputText: (inputText) => set({ inputText }),
      setCameraTarget: (cameraTarget) => set({ cameraTarget }),

      addToHistory: (entry) => set((state) => ({
        history: [entry, ...state.history].slice(0, 50)
      })),

      loadFromHistory: (id) => {
        const state = get()
        const entry = state.history.find(h => h.id === id)
        if (entry) {
          set({
            diagnosis: entry.diagnosis,
            inputText: entry.inputText,
            showHistory: false
          })
        }
      },

      clearHistory: () => set({ history: [] }),

      toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),
      
      togglePresentationMode: () => set((state) => ({ 
        isPresentationMode: !state.isPresentationMode,
        isFullscreen: !state.isPresentationMode ? true : state.isFullscreen
      })),

      toggleHistory: () => set((state) => ({ showHistory: !state.showHistory })),

      setModelType: (modelType) => set({ modelType }),

      reset: () => set({
        diagnosis: null,
        isLoading: false,
        error: null,
        inputText: '',
        cameraTarget: [0, 0, 0],
        isFullscreen: false,
        isPresentationMode: false,
      }),
    }),
    {
      name: HISTORY_KEY,
      partialize: (state) => ({ history: state.history }),
    }
  )
)
