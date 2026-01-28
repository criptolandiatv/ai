# 🚀 SETUP COMPLETO - Next.js + FastAPI Example

## ✅ STATUS DA INSTALAÇÃO

### Python ✅

- [x] Virtual environment criado
- [x] Dependências instaladas (FastAPI, OpenAI, etc)

### Node.js ⏳

- [ ] Instalando dependências... (em andamento)

### Configuração ⚠️

- [x] `.env.local` criado
- [ ] **AÇÃO NECESSÁRIA:** Adicionar OpenAI API key

---

## 🔑 PRÓXIMO PASSO: ADICIONAR API KEY

**Arquivo:** `.env.local`

```env
# Substitua 'your-openai-key-here' pela sua chave real
OPENAI_API_KEY=sk-proj-...
```

**Como obter:**

1. Acesse: <https://platform.openai.com/api-keys>
2. Crie uma nova API key
3. Copie e cole no `.env.local`

---

## 🚀 COMO RODAR

### Opção 1: Comando Único (Recomendado)

```bash
npm run dev
```

Isso vai:

1. Iniciar FastAPI backend (Python) na porta 8000
2. Iniciar Next.js frontend na porta 3000

### Opção 2: Separado (Para Debug)

**Terminal 1 - Backend:**

```bash
cd C:\Users\sergi\.gemini\antigravity\scratch\ai\examples\next-fastapi
.\venv\Scripts\activate
uvicorn api.index:app --reload --port 8000
```

**Terminal 2 - Frontend:**

```bash
cd C:\Users\sergi\.gemini\antigravity\scratch\ai\examples\next-fastapi
npm run dev
```

---

## 🌐 ACESSAR

Após rodar `npm run dev`:

- **Frontend:** <http://localhost:3000>
- **Backend API:** <http://localhost:8000/api/chat>

---

## 📚 EXEMPLOS DISPONÍVEIS

O app tem 3 exemplos:

### 1. Basic Chat (Text Protocol)

**URL:** <http://localhost:3000/01-chat-text>

**Código:**

```typescript
const { messages, sendMessage } = useChat({
  transport: new TextStreamChatTransport({
    api: '/api/chat?protocol=text',
  }),
});
```

**Features:**

- ✅ Streaming de texto simples
- ✅ Sem tools
- ✅ Mais rápido

---

### 2. Chat with Tools (Data Protocol)

**URL:** <http://localhost:3000/02-chat-data>

**Código:**

```typescript
const { messages, sendMessage } = useChat({
  api: '/api/chat',  // Data protocol por padrão
});
```

**Features:**

- ✅ Streaming com tool calling
- ✅ Weather tool example
- ✅ Tool UI feedback

**Teste:**

- "What's the weather in San Francisco?"
- "Tell me the temperature in Tokyo in celsius"

---

### 3. Chat with Attachments

**URL:** <http://localhost:3000/03-chat-attachments>

**Features:**

- ✅ Upload de arquivos
- ✅ Análise de imagens
- ✅ Multi-modal AI

---

## 🔍 O QUE ESTUDAR

### Backend (Python)

**Arquivo:** `api/index.py`

**Principais funções:**

1. `stream_text()` - Lógica de streaming
2. `handle_chat_data()` - Endpoint principal
3. Tool registry em `available_tools`

**Protocolo de Streaming:**

```python
# Text protocol
yield "Hello world"

# Data protocol
yield '0:"Hello"\n'              # Text chunk
yield '9:{"toolCallId":"..."}\n' # Tool call
yield 'a:{"result":...}\n'       # Tool result
yield 'd:{"finishReason":"stop"}\n' # Done
```

### Frontend (React)

**Arquivo:** `app/(examples)/02-chat-data/page.tsx`

**Hook useChat:**

```typescript
const { messages, sendMessage, status } = useChat({
  api: '/api/chat'
});

// Renderizar messages
{messages.map(message => (
  <div>
    {message.parts.map(part => {
      if (part.type === 'text') return <div>{part.text}</div>;
      if (isStaticToolUIPart(part)) return <ToolView tool={part} />;
    })}
  </div>
))}
```

---

## 🎯 ADAPTAR PARA TUSS PRO

### 1. Backend Tools

Substituir `get_current_weather` por:

```python
available_tools = {
    "search_pubmed": search_pubmed_tool,
    "analyze_trend": analyze_trend_tool,
    "generate_content": generate_content_tool,
}
```

### 2. Frontend Integration

Integrar com mapa 3D:

```typescript
// Quando clicar no mapa
const handleTrendClick = (trend) => {
  setSelectedTrend(trend);
  setShowChat(true);
};

// Chat component
<TussProChat
  selectedTrend={selectedTrend}
  onClose={() => setShowChat(false)}
/>
```

### 3. Tool UI Components

Criar componentes específicos:

```typescript
{isStaticToolUIPart(part) && (
  <>
    {getStaticToolName(part) === 'search_pubmed' && (
      <PubMedResults results={part.output} />
    )}
    {getStaticToolName(part) === 'analyze_trend' && (
      <TrendAnalysis data={part.output} />
    )}
  </>
)}
```

---

## ⚡ DICAS

### Performance

- Use `streamProtocol: 'text'` para respostas simples
- Use `streamProtocol: 'data'` apenas quando precisar de tools

### Debug

- Abra DevTools Network tab para ver streaming
- Backend logs aparecem no terminal Python
- Frontend logs no browser console

### Customização

- Modifique `api/utils/tools.py` para adicionar tools
- Modifique `api/utils/prompt.py` para customizar prompts
- Modifique `app/components.tsx` para UI customizada

---

## 🐛 TROUBLESHOOTING

### Erro: "OPENAI_API_KEY not found"

**Solução:** Adicione a key no `.env.local`

### Erro: "Port 3000 already in use"

**Solução:**

```bash
# Matar processo na porta 3000
npx kill-port 3000
```

### Erro: "Module not found"

**Solução:**

```bash
# Reinstalar dependências
rm -rf node_modules
npm install
```

### Backend não conecta

**Solução:**

```bash
# Verificar se FastAPI está rodando
curl http://localhost:8000/api/chat
```

---

## 📊 PRÓXIMOS PASSOS

1. ✅ Rodar o exemplo
2. ✅ Testar os 3 exemplos
3. ✅ Estudar código backend
4. ✅ Estudar código frontend
5. ✅ Adaptar para TUSS Pro

**Quando `npm install` terminar, rode:** `npm run dev` 🚀
