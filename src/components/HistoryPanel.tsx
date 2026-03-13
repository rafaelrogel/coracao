'use client'

import { useMedicalStore } from '@/store/useMedicalStore'
import { HistoryEntry } from '@/types/medical'

const CONDITION_LABELS: Record<string, string> = {
  stenosis: 'Estenose',
  plaque: 'Placa',
  aneurysm: 'Aneurisma',
  occlusion: 'Oclusão',
  calcification: 'Calcificação',
  dissection: 'Dissecção',
  thrombus: 'Trombo',
  atheroma: 'Ateroma',
}

const ARTERY_LABELS: Record<string, string> = {
  LAD: 'DA',
  RCA: 'CD',
  LCx: 'Cx',
  LMCA: 'TCE',
  carotid_left: 'Car. Esq.',
  carotid_right: 'Car. Dir.',
  aorta: 'Aorta',
  pulmonary: 'Pulmonar',
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) return 'Agora'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}min atrás`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h atrás`
  
  return date.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function HistoryItem({ entry, onSelect }: { entry: HistoryEntry; onSelect: () => void }) {
  const { diagnosis } = entry
  
  return (
    <button
      onClick={onSelect}
      className="w-full text-left p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg border border-slate-700 hover:border-clinical-accent transition-all group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">
              {ARTERY_LABELS[diagnosis.artery] || diagnosis.artery}
            </span>
            <span className="text-xs px-1.5 py-0.5 bg-slate-700 text-slate-300 rounded">
              {diagnosis.blockage}%
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 truncate">
            {CONDITION_LABELS[diagnosis.type] || diagnosis.type}
          </p>
        </div>
        <span className="text-xs text-slate-500 whitespace-nowrap">
          {formatDate(entry.timestamp)}
        </span>
      </div>
      <p className="text-xs text-slate-500 mt-2 line-clamp-2 group-hover:text-slate-400">
        {entry.inputText}
      </p>
    </button>
  )
}

export default function HistoryPanel() {
  const { history, showHistory, toggleHistory, loadFromHistory, clearHistory } = useMedicalStore()

  if (!showHistory) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md max-h-[80vh] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-clinical-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Histórico de Diagnósticos
          </h2>
          <button
            onClick={toggleHistory}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {history.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 mx-auto text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-slate-500 mt-3 text-sm">
                Nenhum diagnóstico no histórico
              </p>
            </div>
          ) : (
            history.map((entry) => (
              <HistoryItem
                key={entry.id}
                entry={entry}
                onSelect={() => loadFromHistory(entry.id)}
              />
            ))
          )}
        </div>

        {history.length > 0 && (
          <div className="p-4 border-t border-slate-700">
            <button
              onClick={clearHistory}
              className="w-full py-2 px-4 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
            >
              Limpar histórico
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
