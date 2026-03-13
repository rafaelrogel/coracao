'use client'

import { useState, useCallback, useEffect } from 'react'
import DiagnosisPanel from '@/components/DiagnosisPanel'
import PatientExplanation from '@/components/PatientExplanation'
import HistoryPanel from '@/components/HistoryPanel'
import ExportPanel from '@/components/ExportPanel'
import { useMedicalStore } from '@/store/useMedicalStore'

export default function Home() {
  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(null)
  const [Scene3D, setScene3D] = useState<any>(null)
  const isFullscreen = useMedicalStore((s) => s.isFullscreen)
  const toggleFullscreen = useMedicalStore((s) => s.toggleFullscreen)
  const isPresentationMode = useMedicalStore((s) => s.isPresentationMode)

  useEffect(() => {
    import('@/components/Scene3D').then((mod) => {
      setScene3D(() => mod.default)
    })
  }, [])

  const handleCanvasReady = useCallback((canvas: HTMLCanvasElement | null) => {
    setCanvasElement(canvas)
  }, [])

  const captureImage = useCallback(async (format: 'png' | 'jpeg', quality = 0.95): Promise<string> => {
    if (!canvasElement) throw new Error('Canvas not available')
    return canvasElement.toDataURL(`image/${format}`, quality)
  }, [canvasElement])

  return (
    <>
      <main className="h-screen w-screen flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-96 bg-slate-900/80 backdrop-blur-sm border-r border-slate-700 flex flex-col overflow-hidden">
          <DiagnosisPanel />
          <PatientExplanation />
        </aside>

        {/* Main 3D View */}
        <section className="flex-1 p-4 relative flex flex-col">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-slate-700">
                <span className="text-lg font-bold text-white">CardioView</span>
                <span className="text-lg font-bold text-clinical-accent ml-1">3D</span>
              </div>
              <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
                v2.0
              </span>
            </div>

            <div className="flex items-center gap-2">
              <ExportPanel captureImage={captureImage} />
              
              <button
                onClick={toggleFullscreen}
                className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-400 hover:text-white transition-colors"
                title="Expandir visualização"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            </div>
          </div>

          {/* 3D Viewer */}
          <div className={`flex-1 ${isFullscreen ? 'fixed inset-0 z-40' : ''}`}>
            {Scene3D ? (
              <Scene3D onCanvasReady={handleCanvasReady} />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-clinical-navy rounded-xl">
                <div className="text-center">
                  <div className="animate-spin h-12 w-12 border-4 border-clinical-accent border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-slate-400 mt-4">Carregando...</p>
                </div>
              </div>
            )}
            
            {isFullscreen && (
              <button
                onClick={toggleFullscreen}
                className="absolute top-4 right-4 p-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-600 rounded-lg text-white transition-colors z-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Legend */}
          <div className="mt-4 bg-slate-900/80 backdrop-blur-sm rounded-lg px-4 py-3 border border-slate-700">
            <p className="text-xs text-slate-500 mb-2">Legenda de Condições:</p>
            <div className="flex flex-wrap gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span className="text-slate-400">Estenose</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                <span className="text-slate-400">Placa/Ateroma</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="text-slate-400">Aneurisma</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-gray-300"></span>
                <span className="text-slate-400">Calcificação</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-900"></span>
                <span className="text-slate-400">Oclusão/Trombo</span>
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* Modals */}
      <HistoryPanel />
      {isPresentationMode && <PresentationModeComponent captureImage={captureImage} />}
    </>
  )
}

function PresentationModeComponent({ captureImage }: { captureImage: (format: 'png' | 'jpeg', quality?: number) => Promise<string> }) {
  const { togglePresentationMode, diagnosis } = useMedicalStore()
  const [Scene3D, setScene3D] = useState<any>(null)
  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(null)

  useEffect(() => {
    import('@/components/Scene3D').then((mod) => {
      setScene3D(() => mod.default)
    })

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        togglePresentationMode()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [togglePresentationMode])

  const handleCanvasReady = useCallback((canvas: HTMLCanvasElement | null) => {
    setCanvasElement(canvas)
  }, [])

  const localCaptureImage = useCallback(async (format: 'png' | 'jpeg', quality = 0.95): Promise<string> => {
    if (!canvasElement) throw new Error('Canvas not available')
    return canvasElement.toDataURL(`image/${format}`, quality)
  }, [canvasElement])

  const SEVERITY_CONFIG: Record<string, { label: string; color: string; border: string }> = {
    mild: { label: 'Leve', color: 'bg-green-500', border: 'border-green-500' },
    moderate: { label: 'Moderado', color: 'bg-yellow-500', border: 'border-yellow-500' },
    severe: { label: 'Severo', color: 'bg-orange-500', border: 'border-orange-500' },
    critical: { label: 'Crítico', color: 'bg-red-500', border: 'border-red-500' },
  }

  const ARTERY_NAMES: Record<string, string> = {
    LAD: 'Artéria Descendente Anterior',
    RCA: 'Artéria Coronária Direita',
    LCx: 'Artéria Circunflexa',
    LMCA: 'Tronco da Coronária Esquerda',
    carotid_left: 'Carótida Interna Esquerda',
    carotid_right: 'Carótida Interna Direita',
    aorta: 'Aorta',
    pulmonary: 'Artéria Pulmonar',
  }

  const CONDITION_NAMES: Record<string, string> = {
    stenosis: 'Estenose',
    plaque: 'Placa',
    aneurysm: 'Aneurisma',
    occlusion: 'Oclusão',
    calcification: 'Calcificação',
    dissection: 'Dissecção',
    thrombus: 'Trombo',
    atheroma: 'Ateroma',
  }

  const severity = diagnosis?.severity ? SEVERITY_CONFIG[diagnosis.severity] : null

  return (
    <div className="fixed inset-0 z-50 bg-clinical-navy flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700">
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold text-white">CardioView</span>
          <span className="text-xl font-bold text-clinical-accent">3D</span>
          <span className="text-slate-500 mx-2">|</span>
          <span className="text-sm text-slate-400">Modo Apresentação</span>
        </div>

        <div className="flex items-center gap-3">
          <ExportPanel captureImage={localCaptureImage} />
          <button
            onClick={togglePresentationMode}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-white"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Sair (ESC)
          </button>
        </div>
      </header>

      <div className="flex-1 flex">
        <div className="flex-1">
          {Scene3D && <Scene3D onCanvasReady={handleCanvasReady} className="rounded-none" />}
        </div>

        {diagnosis && (
          <aside className="w-96 bg-slate-900/90 border-l border-slate-700 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Diagnóstico</h2>
              {severity && (
                <span className={`text-xs px-3 py-1 rounded-full ${severity.color} text-white font-medium`}>
                  {severity.label}
                </span>
              )}
            </div>

            <div className="space-y-4 flex-1">
              <div className={`p-4 rounded-xl bg-slate-800/50 border-l-4 ${severity?.border || 'border-clinical-accent'}`}>
                <p className="text-xs text-slate-500 uppercase mb-1">Localização</p>
                <p className="text-white font-medium text-lg">
                  {ARTERY_NAMES[diagnosis.artery] || diagnosis.artery}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-slate-800/50">
                  <p className="text-xs text-slate-500 uppercase mb-1">Condição</p>
                  <p className="text-white font-medium capitalize">
                    {CONDITION_NAMES[diagnosis.type] || diagnosis.type}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/50">
                  <p className="text-xs text-slate-500 uppercase mb-1">Obstrução</p>
                  <p className="text-2xl font-bold text-clinical-accent">
                    {diagnosis.blockage}%
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-clinical-accent/20 to-blue-600/10 border border-clinical-accent/30">
                <p className="text-xs text-clinical-accent uppercase mb-2">Para o Paciente</p>
                <p className="text-white text-lg leading-relaxed">
                  {diagnosis.patient_explanation}
                </p>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
