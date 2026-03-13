'use client'

import { useState, useRef } from 'react'
import { useMedicalStore } from '@/store/useMedicalStore'
import { jsPDF } from 'jspdf'

interface ExportPanelProps {
  canvasRef: React.RefObject<{ captureImage: (format: 'png' | 'jpeg', quality?: number) => Promise<string> }>
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

export default function ExportPanel({ canvasRef }: ExportPanelProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const diagnosis = useMedicalStore((s) => s.diagnosis)
  const inputText = useMedicalStore((s) => s.inputText)

  const exportAsImage = async (format: 'png' | 'jpeg') => {
    if (!canvasRef.current) return
    setIsExporting(true)

    try {
      const dataUrl = await canvasRef.current.captureImage(format, 0.95)
      
      const link = document.createElement('a')
      link.download = `cardioview-${diagnosis?.artery || 'heart'}-${Date.now()}.${format}`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Export failed:', err)
    } finally {
      setIsExporting(false)
      setShowMenu(false)
    }
  }

  const exportAsPDF = async () => {
    if (!canvasRef.current || !diagnosis) return
    setIsExporting(true)

    try {
      const dataUrl = await canvasRef.current.captureImage('jpeg', 0.9)
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      })

      // Header
      pdf.setFillColor(10, 22, 40)
      pdf.rect(0, 0, 297, 30, 'F')
      
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(20)
      pdf.text('CardioView 3D - Relatório de Diagnóstico', 15, 18)

      pdf.setFontSize(10)
      pdf.setTextColor(150, 150, 150)
      pdf.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 230, 18)

      // Image
      const imgWidth = 140
      const imgHeight = 100
      pdf.addImage(dataUrl, 'JPEG', 15, 40, imgWidth, imgHeight)

      // Diagnosis info
      const infoX = 165
      let infoY = 45

      pdf.setTextColor(59, 130, 246)
      pdf.setFontSize(14)
      pdf.text('Informações do Diagnóstico', infoX, infoY)
      
      infoY += 12
      pdf.setTextColor(60, 60, 60)
      pdf.setFontSize(11)

      const info = [
        ['Artéria:', ARTERY_NAMES[diagnosis.artery] || diagnosis.artery],
        ['Condição:', CONDITION_NAMES[diagnosis.type] || diagnosis.type],
        ['Obstrução:', `${diagnosis.blockage}%`],
        ['Severidade:', diagnosis.severity || 'N/A'],
      ]

      info.forEach(([label, value]) => {
        pdf.setFont('helvetica', 'bold')
        pdf.text(label, infoX, infoY)
        pdf.setFont('helvetica', 'normal')
        pdf.text(value, infoX + 30, infoY)
        infoY += 8
      })

      // Patient explanation
      infoY += 10
      pdf.setTextColor(59, 130, 246)
      pdf.setFontSize(12)
      pdf.text('Explicação para o Paciente', infoX, infoY)

      infoY += 8
      pdf.setTextColor(60, 60, 60)
      pdf.setFontSize(10)
      
      const splitText = pdf.splitTextToSize(diagnosis.patient_explanation, 115)
      pdf.text(splitText, infoX, infoY)

      // Original input
      infoY = 150
      pdf.setFillColor(245, 245, 245)
      pdf.rect(15, infoY - 5, 267, 25, 'F')
      
      pdf.setTextColor(100, 100, 100)
      pdf.setFontSize(9)
      pdf.text('Diagnóstico Original:', 20, infoY + 3)
      
      pdf.setTextColor(60, 60, 60)
      pdf.setFontSize(10)
      const inputSplit = pdf.splitTextToSize(inputText || 'N/A', 250)
      pdf.text(inputSplit, 20, infoY + 11)

      // Footer
      pdf.setFillColor(10, 22, 40)
      pdf.rect(0, 200, 297, 10, 'F')
      pdf.setTextColor(150, 150, 150)
      pdf.setFontSize(8)
      pdf.text('CardioView 3D - Sistema de Visualização Médica', 15, 206)
      pdf.text('Este documento é apenas para fins informativos', 200, 206)

      pdf.save(`cardioview-relatorio-${Date.now()}.pdf`)
    } catch (err) {
      console.error('PDF export failed:', err)
    } finally {
      setIsExporting(false)
      setShowMenu(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isExporting}
        className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm text-white transition-colors disabled:opacity-50"
      >
        {isExporting ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Exportando...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exportar
          </>
        )}
      </button>

      {showMenu && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-slate-800 border border-slate-600 rounded-lg shadow-xl overflow-hidden z-50">
          <button
            onClick={() => exportAsImage('png')}
            className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-white hover:bg-slate-700 transition-colors"
          >
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Imagem PNG
          </button>
          <button
            onClick={() => exportAsImage('jpeg')}
            className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-white hover:bg-slate-700 transition-colors"
          >
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Imagem JPEG
          </button>
          <div className="border-t border-slate-700" />
          <button
            onClick={exportAsPDF}
            disabled={!diagnosis}
            className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-white hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Relatório PDF
            {!diagnosis && <span className="text-xs text-slate-500 ml-auto">Requer diagnóstico</span>}
          </button>
        </div>
      )}
    </div>
  )
}
