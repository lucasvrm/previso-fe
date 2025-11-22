# Guia de Configuração - Previso Frontend

Este guia fornece instruções detalhadas para configurar o ambiente de desenvolvimento local do projeto Previso.

## Índice

- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
  - [Frontend (React/Vite)](#frontend-reactvite)
  - [Edge Functions (Supabase)](#edge-functions-supabase)
- [Desenvolvimento Local](#desenvolvimento-local)
- [Testes](#testes)

## Pré-requisitos

- Node.js >= 18.x
- npm >= 9.x
- Conta no Supabase (para obter as credenciais)
- Supabase CLI (opcional, para desenvolvimento com Edge Functions locais)

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/lucasvrm/previso-fe.git
cd previso-fe
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente (veja seção abaixo)

## Variáveis de Ambiente

### Frontend (React/Vite)

O frontend utiliza Vite e requer variáveis prefixadas com `VITE_`.

**Criar arquivo `.env.local` na raiz do projeto:**

```bash
# Supabase Configuration (Frontend)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend API URL
VITE_API_URL=https://bipolar-engine.onrender.com
```

**Onde obter os valores:**
- Acesse o [Supabase Dashboard](https://app.supabase.com)
- Vá para: **Settings** > **API**
- `VITE_SUPABASE_URL`: URL do projeto (Project URL)
- `VITE_SUPABASE_ANON_KEY`: Chave anônima/pública (anon/public key)

⚠️ **IMPORTANTE:** NUNCA use a `service_role` key no frontend! Use apenas a `anon` key.

### Edge Functions (Supabase)

As Edge Functions do Supabase são executadas no Deno runtime e usam variáveis de ambiente diferentes.

#### Distinção Importante: Backend vs Edge Functions

| Contexto | Variável de Ambiente | Quando é usada |
|----------|---------------------|----------------|
| **Backend Python** | `SUPABASE_SERVICE_KEY` | Servidores backend externos (ex: Flask, FastAPI) |
| **Edge Functions** | `SUPABASE_SERVICE_ROLE_KEY` | Funções serverless do Supabase (Deno) |

#### Configuração para Desenvolvimento Local

**Em PRODUÇÃO (Supabase Cloud):**
- A variável `SUPABASE_SERVICE_ROLE_KEY` é **injetada automaticamente**
- A variável `SUPABASE_URL` é **injetada automaticamente**
- Você NÃO precisa configurar nada manualmente no painel

**Para desenvolvimento LOCAL com `supabase functions serve`:**

1. Crie/atualize o arquivo `.env` na raiz do projeto:

```bash
# Edge Functions Local Development
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Opcional: ANON_KEY se necessário para outras funções
SUPABASE_ANON_KEY=your_anon_key
```

2. **Onde obter o `service_role` key:**
   - Acesse o [Supabase Dashboard](https://app.supabase.com)
   - Vá para: **Settings** > **API**
   - Copie o valor de **service_role** (secret key)

3. Execute as Edge Functions localmente:
```bash
# Inicia o Supabase local
supabase start

# Serve a função específica
supabase functions serve invite-therapist --env-file .env
```

⚠️ **SEGURANÇA:**
- NUNCA faça commit do arquivo `.env` ou `.env.local` no git
- A `service_role` key tem privilégios administrativos completos
- Use apenas em ambientes seguros (backend/serverless)

#### Exemplo Completo de `.env` para Desenvolvimento Local

```bash
# Frontend Variables (Vite)
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Backend API (se aplicável)
VITE_API_URL=https://bipolar-engine.onrender.com

# Edge Functions Local Development
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Desenvolvimento Local

### Iniciar o Frontend

```bash
npm run dev
```

O aplicativo estará disponível em: http://localhost:5173

### Trabalhar com Edge Functions

1. **Instalar Supabase CLI** (se ainda não tiver):
```bash
npm install -g supabase
```

2. **Iniciar ambiente Supabase local**:
```bash
supabase start
```

Isso iniciará:
- Database: `postgresql://postgres:postgres@localhost:54322/postgres`
- Studio (UI): http://localhost:54323
- API: http://localhost:54321

3. **Testar Edge Functions localmente**:
```bash
# Com arquivo .env
supabase functions serve invite-therapist --env-file .env

# Ou especificando variáveis diretamente
supabase functions serve invite-therapist --env-file .env --no-verify-jwt
```

4. **Fazer deploy de Edge Functions**:
```bash
supabase functions deploy invite-therapist
```

## Testes

### Testes Unitários

```bash
# Executar todos os testes
npm test

# Executar em modo watch
npm run test:watch

# Gerar relatório de cobertura
npm run test:coverage
```

### Testes E2E (Cypress)

```bash
# Modo interativo
npm run cypress:open

# Modo headless
npm run cypress:run
```

### Linting

```bash
npm run lint
```

## Estrutura de Diretórios

```
previso-fe/
├── src/                    # Código fonte do frontend
│   ├── api/               # Clientes API (Supabase, Backend)
│   ├── components/        # Componentes React
│   └── ...
├── supabase/              # Configuração Supabase
│   ├── functions/         # Edge Functions (Deno)
│   │   ├── invite-therapist/
│   │   └── _shared/
│   └── config.toml        # Configuração do Supabase CLI
├── tests/                 # Testes unitários
├── cypress/               # Testes E2E
├── .env.example           # Exemplo de variáveis (frontend)
└── .env.local             # Suas variáveis locais (não commitado)
```

## Troubleshooting

### Erro: "Variáveis de ambiente do Supabase não configuradas"

**Solução:** Certifique-se de criar o arquivo `.env.local` com as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.

### Edge Function retorna erro 500

**Solução:** Verifique se o arquivo `.env` contém `SUPABASE_SERVICE_ROLE_KEY` ao executar localmente com `supabase functions serve`.

### "Cannot find module @supabase/supabase-js"

**Solução:** Execute `npm install` novamente.

## Recursos Adicionais

- [Documentação do Supabase](https://supabase.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Vite Environment Variables](https://vite.dev/guide/env-and-mode.html)
- [Deno Deploy Environment Variables](https://deno.com/deploy/docs/environment-variables)

## Suporte

Para dúvidas ou problemas:
1. Verifique a documentação acima
2. Consulte os arquivos de exemplo (`.env.example`)
3. Abra uma issue no repositório
