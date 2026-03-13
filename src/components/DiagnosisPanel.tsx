'use client'

import { useState } from 'react'
import { useMedicalStore } from '@/store/useMedicalStore'

const EXAMPLE_DIAGNOSES = [
  'Artéria Descendente Anterior com 80% de obstrução',
  'Placa de ateroma na carótida interna direita com 60% de estenose',
  'Estenose severa de 90% na coronária direita',
  'Obstrução moderada de 45% na circunflexa',
]

export default function DiagnosisPanel() {
  const { inputText, setInputText, setDiagnosis, setLoading, setError, isLoading, reset } = useMedicalStore()
  const [localInput, setLocalInput] = useState(inputText)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!localInput.trim() || isLoading) return

    setInputText(localInput)
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: localInput }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar diagnóstico')
      }

      setDiagnosis(data.diagnosis)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const handleExampleClick = (example: string) => {
    setLocalInput(example)
  }

  const handleReset = () => {
    setLocalInput('')
    reset()
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-semibold text-white flex items-center gap-2">
          <svg className="w-6 h-6 text-clinical-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Diagnóstico Médico
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Visualização 3D para comunicação com pacientes
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 flex-1 flex flex-col">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Descreva o diagnóstico
        </label>
        <textarea
          value={localInput}
          onChange={(e) => setLocalInput(e.target.value)}
          placeholder="Ex: Artéria Descendente Anterior com 80% de obstrução"
          className="w-full h-32 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-clinical-accent focus:border-transparent resize-none"
          disabled={isLoading}
        />

        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            disabled={isLoading || !localInput.trim()}
            className="flex-1 py-3 px-4 bg-clinical-accent hover:bg-blue-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analisando...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Visualizar
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Limpar
          </button>
        </div>

        <div className="mt-6">
          <p className="text-xs text-slate-500 mb-2">Exemplos rápidos:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_DIAGNOSES.map((example, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleExampleClick(example)}
                className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition-colors border border-slate-700"
              >
                {example.length > 35 ? example.slice(0, 35) + '...' : example}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  )
}
