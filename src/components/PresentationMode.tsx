'use client'

import { useEffect, useCallback, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useMedicalStore } from '@/store/useMedicalStore'
import ExportPanel from './ExportPanel'

const HeartViewer = dynamic(() => import('./HeartViewer'), { ssr: false })

const SEVERITY_CONFIG = {
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

export default function PresentationMode() {
  const { isPresentationMode, togglePresentationMode, diagnosis } = useMedicalStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(null)

  const handleCanvasReady = useCallback((canvas: HTMLCanvasElement | null) => {
    setCanvasElement(canvas)
  }, [])

  const captureImage = useCallback(async (format: 'png' | 'jpeg', quality = 0.95): Promise<string> => {
    if (!canvasElement) throw new Error('Canvas not available')
    return canvasElement.toDataURL(`image/${format}`, quality)
  }, [canvasElement])

  const handleFullscreen = useCallback(async () => {
    if (!containerRef.current) return

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (err) {
      console.error('Fullscreen error:', err)
    }
  }, [])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isPresentationMode) {
      togglePresentationMode()
    }
    if ((e.key === 'f' || e.key === 'F') && isPresentationMode) {
      handleFullscreen()
    }
  }, [isPresentationMode, togglePresentationMode, handleFullscreen])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!isPresentationMode) return null

  const severity = diagnosis?.severity ? SEVERITY_CONFIG[diagnosis.severity] : null

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-clinical-navy flex flex-col"
    >
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">CardioView</span>
            <span className="text-xl font-bold text-clinical-accent">3D</span>
          </div>
          <span className="text-slate-500">|</span>
          <span className="text-sm text-slate-400">Modo Apresentação</span>
        </div>

        <div className="flex items-center gap-3">
          <ExportPanel captureImage={captureImage} />
          
          <button
            onClick={handleFullscreen}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
            title="Alternar tela cheia (F)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>

          <button
            onClick={togglePresentationMode}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Sair (ESC)
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex">
        {/* 3D Viewer */}
        <div className="flex-1 relative">
          <HeartViewer onCanvasReady={handleCanvasReady} className="rounded-none" />
        </div>

        {/* Info Panel */}
        {diagnosis && (
          <aside className="w-96 bg-slate-900/90 backdrop-blur-sm border-l border-slate-700 p-6 flex flex-col">
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
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Localização</p>
                <p className="text-white font-medium text-lg">
                  {ARTERY_NAMES[diagnosis.artery] || diagnosis.artery}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-slate-800/50">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Condição</p>
                  <p className="text-white font-medium capitalize">
                    {CONDITION_NAMES[diagnosis.type] || diagnosis.type}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/50">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Obstrução</p>
                  <p className={`text-2xl font-bold ${severity?.border.replace('border', 'text') || 'text-clinical-accent'}`}>
                    {diagnosis.blockage}%
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-clinical-accent/20 to-blue-600/10 border border-clinical-accent/30">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-clinical-accent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <div>
                    <p className="text-xs text-clinical-accent uppercase tracking-wider mb-2">Para o Paciente</p>
                    <p className="text-white text-lg leading-relaxed">
                      {diagnosis.patient_explanation}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700">
              <p className="text-xs text-slate-500 text-center">
                Use o mouse para interagir com o modelo 3D
              </p>
            </div>
          </aside>
        )}
      </div>

      {/* Footer hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-slate-500 bg-slate-900/80 px-4 py-2 rounded-full">
        Pressione <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-300 mx-1">F</kbd> para tela cheia
        <span className="mx-2">|</span>
        <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-300 mx-1">ESC</kbd> para sair
      </div>
    </div>
  )
}
