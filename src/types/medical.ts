export type ArteryType = 'LAD' | 'RCA' | 'LCx' | 'LMCA' | 'carotid_left' | 'carotid_right'

export type ConditionType = 'stenosis' | 'plaque' | 'aneurysm' | 'occlusion'

export interface DiagnosisData {
  artery: ArteryType
  blockage: number
  type: ConditionType
  patient_explanation: string
  location?: string
  severity?: 'mild' | 'moderate' | 'severe' | 'critical'
}

export interface MedicalState {
  diagnosis: DiagnosisData | null
  isLoading: boolean
  error: string | null
  inputText: string
  cameraTarget: [number, number, number]
  setDiagnosis: (diagnosis: DiagnosisData | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setInputText: (text: string) => void
  setCameraTarget: (target: [number, number, number]) => void
  reset: () => void
}

export interface ArteryConfig {
  id: ArteryType
  name: string
  position: [number, number, number]
  rotation: [number, number, number]
  length: number
  radius: number
  color: string
}
