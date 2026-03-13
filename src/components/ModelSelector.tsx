'use client'

import { useState } from 'react'
import { heartModels, HeartModel, formatSize, getModelsByCategory, getRecommendedModels } from '@/data/heartModels'

interface ModelSelectorProps {
  currentModel: string
  onSelectModel: (filename: string) => void
  onClose: () => void
}

const categoryLabels: Record<HeartModel['category'], string> = {
  normal: 'Coracao Normal',
  congenital: 'Doencas Congenitas',
  valve: 'Valvulas',
  vessel: 'Vasos/Coronarias',
  myocardium: 'Miocardio',
  bloodpool: 'Fluxo Sanguineo',
  other: 'Outros',
}

const categoryIcons: Record<HeartModel['category'], string> = {
  normal: '❤️',
  congenital: '🫀',
  valve: '🔄',
  vessel: '🩸',
  myocardium: '💪',
  bloodpool: '💉',
  other: '📦',
}

export default function ModelSelector({ currentModel, onSelectModel, onClose }: ModelSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<HeartModel['category'] | 'recommended'>('recommended')
  const [searchTerm, setSearchTerm] = useState('')

  const categories: (HeartModel['category'] | 'recommended')[] = [
    'recommended',
    'normal',
    'vessel',
    'congenital',
    'myocardium',
    'bloodpool',
    'other',
  ]

  const filteredModels = selectedCategory === 'recommended'
    ? getRecommendedModels()
    : getModelsByCategory(selectedCategory)

  const searchedModels = searchTerm
    ? heartModels.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.condition?.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : filteredModels

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Biblioteca de Modelos 3D</h2>
            <p className="text-sm text-slate-400">NIH 3D Heart Library - {heartModels.length} modelos disponiveis</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-800">
          <input
            type="text"
            placeholder="Buscar modelo por nome, descricao ou condicao..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="flex h-[60vh]">
          {/* Categories Sidebar */}
          <div className="w-48 border-r border-slate-800 p-2 overflow-y-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat)
                  setSearchTerm('')
                }}
                className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors flex items-center gap-2 ${
                  selectedCategory === cat
                    ? 'bg-red-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>{cat === 'recommended' ? '⭐' : categoryIcons[cat]}</span>
                <span className="text-sm">
                  {cat === 'recommended' ? 'Recomendados' : categoryLabels[cat]}
                </span>
              </button>
            ))}
          </div>

          {/* Models Grid */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {searchedModels.map(model => (
                <button
                  key={model.id}
                  onClick={() => {
                    onSelectModel(model.filename)
                    onClose()
                  }}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    currentModel === model.filename
                      ? 'bg-red-600/20 border-red-500'
                      : 'bg-slate-800/50 border-slate-700 hover:border-red-500/50 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{categoryIcons[model.category]}</span>
                        <h3 className="font-semibold text-white text-sm">{model.name}</h3>
                        {model.recommended && (
                          <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                            ⭐
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{model.description}</p>
                      {model.condition && (
                        <span className="inline-block mt-2 px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">
                          {model.condition}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500">{formatSize(model.size)}</span>
                      {currentModel === model.filename && (
                        <div className="mt-1 text-green-400 text-xs">✓ Ativo</div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {searchedModels.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                Nenhum modelo encontrado
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">
              Fonte: NIH 3D Heart Library (Dominio Publico)
            </span>
            <a
              href="https://3d.nih.gov/collections/heart-library"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Ver biblioteca completa →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
