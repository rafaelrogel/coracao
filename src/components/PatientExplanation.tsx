'use client'

import { useMedicalStore } from '@/store/useMedicalStore'

const SEVERITY_CONFIG = {
  mild: { label: 'Leve', color: 'bg-green-500', textColor: 'text-green-400' },
  moderate: { label: 'Moderado', color: 'bg-yellow-500', textColor: 'text-yellow-400' },
  severe: { label: 'Severo', color: 'bg-orange-500', textColor: 'text-orange-400' },
  critical: { label: 'Crítico', color: 'bg-red-500', textColor: 'text-red-400' },
}

const ARTERY_NAMES: Record<string, string> = {
  LAD: 'Artéria Descendente Anterior',
  RCA: 'Artéria Coronária Direita',
  LCx: 'Artéria Circunflexa',
  LMCA: 'Tronco da Coronária Esquerda',
  carotid_left: 'Carótida Interna Esquerda',
  carotid_right: 'Carótida Interna Direita',
}

export default function PatientExplanation() {
  const { diagnosis, error, isLoading } = useMedicalStore()

  if (isLoading) {
    return (
      <div className="p-6 border-t border-slate-700">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-700 rounded w-3/4"></div>
          <div className="h-4 bg-slate-700 rounded w-1/2"></div>
          <div className="h-20 bg-slate-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 border-t border-slate-700">
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-red-400 font-medium">Erro na análise</p>
              <p className="text-red-300 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!diagnosis) {
    return (
      <div className="p-6 border-t border-slate-700">
        <div className="text-center py-8">
          <svg className="w-12 h-12 mx-auto text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <p className="text-slate-500 mt-3 text-sm">
            Insira um diagnóstico para visualizar<br />a explicação para o paciente
          </p>
        </div>
      </div>
    )
  }

  const severity = SEVERITY_CONFIG[diagnosis.severity || 'moderate']

  return (
    <div className="p-6 border-t border-slate-700 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-300">Resultado da Análise</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${severity.color} text-white font-medium`}>
          {severity.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-800/50 rounded-lg p-3">
          <p className="text-xs text-slate-500">Artéria</p>
          <p className="text-sm text-white font-medium mt-1">
            {ARTERY_NAMES[diagnosis.artery] || diagnosis.artery}
          </p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3">
          <p className="text-xs text-slate-500">Obstrução</p>
          <p className={`text-lg font-bold mt-1 ${severity.textColor}`}>
            {diagnosis.blockage}%
          </p>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-clinical-accent mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <div>
            <p className="text-xs text-slate-500 mb-1">Para explicar ao paciente:</p>
            <p className="text-sm text-white leading-relaxed">
              {diagnosis.patient_explanation}
            </p>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <p className="text-xs text-slate-600">
          Tipo: <span className="text-slate-400 capitalize">{diagnosis.type}</span>
        </p>
      </div>
    </div>
  )
}
