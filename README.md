# CardioView 3D - Medical Visualization System

Sistema de visualização 3D para comunicação de diagnósticos cardiovasculares com pacientes.

## Funcionalidades

- **Input de Diagnóstico**: A médica insere diagnósticos em linguagem natural
- **Processamento por IA**: Extração automática de dados estruturados via LLM (DeepSeek, OpenAI, etc.)
- **Visualização 3D**: Modelo interativo do coração e sistema vascular com React Three Fiber
- **Explicação para Paciente**: Geração de texto acolhedor para comunicação com o paciente

## Stack Tecnológica

- **Framework**: Next.js 15 (App Router)
- **3D Engine**: React Three Fiber + Three.js + Drei
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **AI Integration**: OpenAI SDK (compatível com DeepSeek, MiMo, etc.)

## Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo de exemplo e configure suas credenciais:

```bash
cp .env.example .env.local
```

Edite `.env.local`:

```env
# Para DeepSeek (recomendado - baixo custo)
OPENAI_API_KEY=sk-your-deepseek-key
OPENAI_BASE_URL=https://api.deepseek.com/v1
LLM_MODEL=deepseek-chat

# Para OpenAI
# OPENAI_API_KEY=sk-your-openai-key
# OPENAI_BASE_URL=https://api.openai.com/v1
# LLM_MODEL=gpt-4o-mini
```

### 3. Executar em desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Uso

1. Digite um diagnóstico no painel lateral (ex: "Artéria Descendente Anterior com 80% de obstrução")
2. Clique em "Visualizar"
3. O modelo 3D será atualizado para mostrar a anomalia na artéria correspondente
4. A explicação para o paciente aparecerá abaixo do formulário

## Artérias Suportadas

| Sigla | Nome Completo |
|-------|---------------|
| LAD | Artéria Descendente Anterior |
| RCA | Artéria Coronária Direita |
| LCx | Artéria Circunflexa |
| LMCA | Tronco da Coronária Esquerda |
| carotid_left | Carótida Interna Esquerda |
| carotid_right | Carótida Interna Direita |

## Estrutura do Projeto

```
src/
├── app/
│   ├── api/diagnose/route.ts  # API de processamento IA
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx               # Página principal
├── components/
│   ├── DiagnosisPanel.tsx     # Formulário de input
│   ├── HeartViewer.tsx        # Visualização 3D
│   └── PatientExplanation.tsx # Card de explicação
├── store/
│   └── useMedicalStore.ts     # Estado global (Zustand)
└── types/
    └── medical.ts             # Tipos TypeScript
```

## Próximos Passos (Roadmap)

- [ ] Importar modelos GLTF realistas de anatomia
- [ ] Adicionar mais condições médicas (aneurismas, placas, etc.)
- [ ] Implementar histórico de diagnósticos
- [ ] Exportar visualização como imagem/PDF
- [ ] Modo de apresentação fullscreen

## Licença

MIT
