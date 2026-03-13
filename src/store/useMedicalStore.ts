import { create } from 'zustand'
import { MedicalState } from '@/types/medical'

export const useMedicalStore = create<MedicalState>((set) => ({
  diagnosis: null,
  isLoading: false,
  error: null,
  inputText: '',
  cameraTarget: [0, 0, 0],

  setDiagnosis: (diagnosis) => set({ diagnosis, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  setInputText: (inputText) => set({ inputText }),
  setCameraTarget: (cameraTarget) => set({ cameraTarget }),
  reset: () => set({
    diagnosis: null,
    isLoading: false,
    error: null,
    inputText: '',
    cameraTarget: [0, 0, 0],
  }),
}))
