'use client'

import dynamic from 'next/dynamic'
import DiagnosisPanel from '@/components/DiagnosisPanel'
import PatientExplanation from '@/components/PatientExplanation'

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

export default function Home() {
  return (
    <main className="h-screen w-screen flex overflow-hidden">
      <aside className="w-96 bg-slate-900/80 backdrop-blur-sm border-r border-slate-700 flex flex-col">
        <DiagnosisPanel />
        <PatientExplanation />
      </aside>

      <section className="flex-1 p-4 relative">
        <HeartViewer />

        <div className="absolute top-6 right-6 bg-slate-900/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-slate-700">
          <span className="text-xs text-slate-400">CardioView</span>
          <span className="text-clinical-accent font-bold ml-1">3D</span>
        </div>
      </section>
    </main>
  )
}
