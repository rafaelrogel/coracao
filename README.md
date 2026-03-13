# CardioView 3D - Medical Visualization System

Sistema avançado de visualização 3D para comunicação de diagnósticos cardiovasculares com pacientes.

![Version](https://img.shields.io/badge/version-2.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React Three Fiber](https://img.shields.io/badge/R3F-8.x-orange)

## Funcionalidades

### Core
- **Input de Diagnóstico**: Médico insere diagnósticos em linguagem natural
- **Processamento por IA**: Extração automática via LLM (DeepSeek, OpenAI, etc.)
- **Visualização 3D**: Modelo interativo do coração e sistema vascular

### Condições Médicas Suportadas
- ✅ **Estenose** - Estreitamento arterial com visualização de obstrução
- ✅ **Placa/Ateroma** - Acúmulo de placa aterosclerótica
- ✅ **Aneurisma** - Dilatação vascular
- ✅ **Oclusão** - Bloqueio total do vaso
- ✅ **Calcificação** - Depósitos de cálcio
- ✅ **Dissecção** - Separação das camadas arteriais
- ✅ **Trombo** - Coágulo sanguíneo

### Artérias Visualizadas
| Código | Nome |
|--------|------|
| LAD | Artéria Descendente Anterior |
| RCA | Artéria Coronária Direita |
| LCx | Artéria Circunflexa |
| LMCA | Tronco da Coronária Esquerda |
| carotid_left | Carótida Interna Esquerda |
| carotid_right | Carótida Interna Direita |
| aorta | Aorta |
| pulmonary | Artéria Pulmonar |

### Recursos Avançados
- 📜 **Histórico de Diagnósticos** - Persistência local com até 50 entradas
- 📸 **Exportar Imagem** - PNG/JPEG de alta qualidade
- 📄 **Relatório PDF** - Documento completo para o paciente
- 🖥️ **Modo Apresentação** - Fullscreen para consultas
- 🎯 **Explicação Automática** - Texto acolhedor gerado por IA

## Stack Tecnológica

- **Framework**: Next.js 15 (App Router)
- **3D Engine**: React Three Fiber + Three.js + Drei
- **Styling**: Tailwind CSS
- **State Management**: Zustand (com persistência)
- **AI Integration**: OpenAI SDK (compatível com DeepSeek, MiMo, etc.)
- **Export**: jsPDF + html2canvas

## Instalação

```bash
# Clone o repositório
git clone https://github.com/rafaelrogel/coracao.git
cd coracao

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
```

## Configuração

Edite `.env.local` com suas credenciais:

```env
# DeepSeek (recomendado - baixo custo)
OPENAI_API_KEY=sk-your-deepseek-key
OPENAI_BASE_URL=https://api.deepseek.com/v1
LLM_MODEL=deepseek-chat

# Ou OpenAI
# OPENAI_API_KEY=sk-your-openai-key
# OPENAI_BASE_URL=https://api.openai.com/v1
# LLM_MODEL=gpt-4o-mini
```

## Uso

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

### Fluxo de Uso

1. Digite um diagnóstico no painel lateral
2. Clique em "Visualizar"
3. O modelo 3D mostra a anomalia na artéria correspondente
4. Use "Apresentar" para modo fullscreen com paciente
5. Exporte como imagem ou PDF para documentação

### Exemplos de Diagnósticos

```
"Artéria Descendente Anterior com 80% de obstrução"
"Aneurisma de 4cm na aorta ascendente"
"Placa calcificada na carótida direita com 65% de estenose"
"Trombo na artéria pulmonar"
"Dissecção da aorta tipo A"
```

## Estrutura do Projeto

```
src/
├── app/
│   ├── api/diagnose/route.ts  # API de processamento IA
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── DiagnosisPanel.tsx     # Formulário de input
│   ├── ExportPanel.tsx        # Exportação PNG/JPEG/PDF
│   ├── HeartViewer.tsx        # Visualização 3D principal
│   ├── HistoryPanel.tsx       # Modal de histórico
│   ├── PatientExplanation.tsx # Card de explicação
│   └── PresentationMode.tsx   # Modo fullscreen
├── store/
│   └── useMedicalStore.ts     # Estado global (Zustand)
└── types/
    └── medical.ts             # Tipos TypeScript
```

## Atalhos de Teclado

| Tecla | Ação |
|-------|------|
| `F` | Alternar tela cheia |
| `ESC` | Sair do modo apresentação |

## Desenvolvimento

```bash
npm run dev      # Desenvolvimento
npm run build    # Build de produção
npm run lint     # Verificar código
```

## Roadmap Implementado

- [x] Importar modelos GLTF realistas de anatomia (infraestrutura pronta)
- [x] Adicionar mais condições médicas
- [x] Implementar histórico de diagnósticos
- [x] Exportar visualização como imagem/PDF
- [x] Modo de apresentação fullscreen

## Licença

MIT

---

Desenvolvido para melhorar a comunicação médico-paciente através de visualização 3D interativa.
