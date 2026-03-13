export type ArteryType = 'LAD' | 'RCA' | 'LCx' | 'LMCA' | 'carotid_left' | 'carotid_right' | 'aorta' | 'pulmonary'

export type ConditionType = 
  | 'stenosis' 
  | 'plaque' 
  | 'aneurysm' 
  | 'occlusion' 
  | 'calcification'
  | 'dissection'
  | 'thrombus'
  | 'atheroma'

export type PlaqueType = 'soft' | 'fibrous' | 'calcified' | 'mixed'

export interface DiagnosisData {
  id: string
  artery: ArteryType
  blockage: number
  type: ConditionType
  patient_explanation: string
  location?: string
  severity?: 'mild' | 'moderate' | 'severe' | 'critical'
  plaqueType?: PlaqueType
  dimensions?: {
    length?: number
    width?: number
  }
  timestamp: number
}

export interface HistoryEntry {
  id: string
  diagnosis: DiagnosisData
  inputText: string
  timestamp: number
}

export interface MedicalState {
  diagnosis: DiagnosisData | null
  history: HistoryEntry[]
  isLoading: boolean
  error: string | null
  inputText: string
  cameraTarget: [number, number, number]
  isFullscreen: boolean
  isPresentationMode: boolean
  showHistory: boolean
  modelType: 'procedural' | 'gltf'
  setDiagnosis: (diagnosis: DiagnosisData | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setInputText: (text: string) => void
  setCameraTarget: (target: [number, number, number]) => void
  addToHistory: (entry: HistoryEntry) => void
  loadFromHistory: (id: string) => void
  clearHistory: () => void
  toggleFullscreen: () => void
  togglePresentationMode: () => void
  toggleHistory: () => void
  setModelType: (type: 'procedural' | 'gltf') => void
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
  branches?: ArteryBranch[]
}

export interface ArteryBranch {
  id: string
  position: [number, number, number]
  rotation: [number, number, number]
  length: number
  radius: number
}

export interface ExportOptions {
  format: 'png' | 'jpeg' | 'pdf'
  quality?: number
  includeInfo?: boolean
  fileName?: string
}
