'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import DiagnosisPanel from '@/components/DiagnosisPanel'
import PatientExplanation from '@/components/PatientExplanation'
import HistoryPanel from '@/components/HistoryPanel'
import ExportPanel from '@/components/ExportPanel'
import { useMedicalStore } from '@/store/useMedicalStore'

const HeartViewer = dynamic(() => import('@/components/HeartViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-clinical-navy rounded-xl">
      <div className="text-center">
        <div className="animate-spin h-12 w-12 border-4 border-clinical-accent border-t-transparent rounded-full mx-auto"></div>
        <p className="text-slate-400 mt-4">Carregando modelo 3D...</p>
      </div>
    </div>
  ),
})

const PresentationMode = dynamic(() => import('@/components/PresentationMode'), {
  ssr: false,
})

export default function Home() {
  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(null)
  const isFullscreen = useMedicalStore((s) => s.isFullscreen)
  const toggleFullscreen = useMedicalStore((s) => s.toggleFullscreen)

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
                v2.0 - Roadmap Completo
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
            <HeartViewer onCanvasReady={handleCanvasReady} />
            
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
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                <span className="text-slate-400">Dissecção</span>
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* Modals */}
      <HistoryPanel />
      <PresentationMode />
    </>
  )
}
