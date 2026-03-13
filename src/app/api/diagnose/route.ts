import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY não configurada')
  }
  return new OpenAI({
    apiKey,
    baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  })
}

const SYSTEM_PROMPT = `Você é um Extrator de Dados Médicos especializado em cardiologia e sistema vascular.
Sua tarefa é analisar diagnósticos médicos em linguagem natural e extrair informações estruturadas.

IMPORTANTE: Responda APENAS com JSON válido, sem markdown, sem explicações adicionais.

Formato de saída obrigatório:
{
  "artery": "LAD" | "RCA" | "LCx" | "LMCA" | "carotid_left" | "carotid_right",
  "blockage": <número de 0 a 100 representando % de obstrução>,
  "type": "stenosis" | "plaque" | "aneurysm" | "occlusion",
  "severity": "mild" | "moderate" | "severe" | "critical",
  "patient_explanation": "<Explicação acolhedora em português para o paciente entender sua condição, máximo 2 frases>"
}

Mapeamento de artérias:
- "Descendente Anterior" ou "DA" ou "LAD" → "LAD"
- "Coronária Direita" ou "CD" ou "RCA" → "RCA"
- "Circunflexa" ou "Cx" ou "LCx" → "LCx"
- "Tronco da Coronária Esquerda" ou "TCE" → "LMCA"
- "Carótida Esquerda" ou "Carótida Interna Esquerda" → "carotid_left"
- "Carótida Direita" ou "Carótida Interna Direita" → "carotid_right"

Severidade baseada na obstrução:
- 0-30%: mild
- 31-50%: moderate
- 51-70%: severe
- 71-100%: critical`

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Texto de diagnóstico é obrigatório' },
        { status: 400 }
      )
    }

    const model = process.env.LLM_MODEL || 'gpt-4o-mini'
    const client = getClient()

    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: text },
      ],
      temperature: 0.1,
      max_tokens: 500,
    })

    const content = completion.choices[0]?.message?.content

    if (!content) {
      return NextResponse.json(
        { error: 'Resposta vazia do modelo' },
        { status: 500 }
      )
    }

    const cleanedContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    const diagnosis = JSON.parse(cleanedContent)

    const validArteries = ['LAD', 'RCA', 'LCx', 'LMCA', 'carotid_left', 'carotid_right']
    if (!validArteries.includes(diagnosis.artery)) {
      return NextResponse.json(
        { error: 'Artéria não reconhecida no diagnóstico' },
        { status: 422 }
      )
    }

    return NextResponse.json({ diagnosis })
  } catch (error) {
    console.error('Diagnosis API Error:', error)
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Erro ao processar resposta do modelo' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
