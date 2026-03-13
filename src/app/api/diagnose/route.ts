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
  "artery": "LAD" | "RCA" | "LCx" | "LMCA" | "carotid_left" | "carotid_right" | "aorta" | "pulmonary",
  "blockage": <número de 0 a 100 representando % de obstrução ou comprometimento>,
  "type": "stenosis" | "plaque" | "aneurysm" | "occlusion" | "calcification" | "dissection" | "thrombus" | "atheroma",
  "severity": "mild" | "moderate" | "severe" | "critical",
  "plaqueType": "soft" | "fibrous" | "calcified" | "mixed" (opcional, apenas se for placa),
  "patient_explanation": "<Explicação acolhedora em português para o paciente entender sua condição, máximo 3 frases, linguagem simples>"
}

Mapeamento de artérias:
- "Descendente Anterior" ou "DA" ou "LAD" → "LAD"
- "Coronária Direita" ou "CD" ou "RCA" → "RCA"
- "Circunflexa" ou "Cx" ou "LCx" → "LCx"
- "Tronco da Coronária Esquerda" ou "TCE" → "LMCA"
- "Carótida Esquerda" ou "Carótida Interna Esquerda" → "carotid_left"
- "Carótida Direita" ou "Carótida Interna Direita" → "carotid_right"
- "Aorta" (qualquer segmento) → "aorta"
- "Pulmonar" ou "Artéria Pulmonar" → "pulmonary"

Mapeamento de condições:
- Estenose, estreitamento → "stenosis"
- Placa, ateroma, aterosclerose → "plaque" ou "atheroma"
- Aneurisma, dilatação → "aneurysm"
- Oclusão, bloqueio total → "occlusion"
- Calcificação, calcificado → "calcification"
- Dissecção → "dissection"
- Trombo, coágulo → "thrombus"

Severidade baseada na obstrução/gravidade:
- 0-30%: mild
- 31-50%: moderate
- 51-70%: severe
- 71-100%: critical

Para aneurismas: baseie a severidade no tamanho (pequeno=mild, médio=moderate, grande=severe, muito grande=critical).
Para dissecções: geralmente severe ou critical.`

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
      max_tokens: 600,
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

    const validArteries = ['LAD', 'RCA', 'LCx', 'LMCA', 'carotid_left', 'carotid_right', 'aorta', 'pulmonary']
    if (!validArteries.includes(diagnosis.artery)) {
      return NextResponse.json(
        { error: 'Artéria não reconhecida no diagnóstico' },
        { status: 422 }
      )
    }

    const validTypes = ['stenosis', 'plaque', 'aneurysm', 'occlusion', 'calcification', 'dissection', 'thrombus', 'atheroma']
    if (!validTypes.includes(diagnosis.type)) {
      diagnosis.type = 'stenosis'
    }

    const validSeverities = ['mild', 'moderate', 'severe', 'critical']
    if (!validSeverities.includes(diagnosis.severity)) {
      if (diagnosis.blockage <= 30) diagnosis.severity = 'mild'
      else if (diagnosis.blockage <= 50) diagnosis.severity = 'moderate'
      else if (diagnosis.blockage <= 70) diagnosis.severity = 'severe'
      else diagnosis.severity = 'critical'
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

    if (error instanceof Error && error.message.includes('API')) {
      return NextResponse.json(
        { error: 'Erro de conexão com o serviço de IA' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
