# Guia de Deploy - Previso Frontend

## 🚀 Configuração de Variáveis de Ambiente

### ⚠️ IMPORTANTE: Erro "Invalid API Key"

Se você está recebendo o erro **"Invalid API key"** durante o login em produção/staging, isso significa que as variáveis de ambiente do Supabase não foram configuradas corretamente na plataforma de deploy.

### Variáveis Obrigatórias

O frontend **REQUER** as seguintes variáveis de ambiente para funcionar:

```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
VITE_API_URL=https://seu-backend.onrender.com
```

### 🔐 Segurança Crítica

**NUNCA** use as seguintes chaves no frontend:
- ❌ `SUPABASE_SERVICE_KEY`
- ❌ `SUPABASE_SERVICE_ROLE_KEY`
- ❌ Qualquer chave que contenha "service" ou "secret"

Essas chaves são **APENAS** para backend/servidor e expô-las no frontend é uma **vulnerabilidade crítica de segurança**.

Use apenas:
- ✅ `VITE_SUPABASE_ANON_KEY` - Chave pública/anônima do Supabase

---

## 📋 Configuração por Plataforma

### Vercel

1. Acesse o dashboard do projeto no Vercel
2. Vá em **Settings** → **Environment Variables**
3. Adicione cada variável:
   - Name: `VITE_SUPABASE_URL`
   - Value: `https://seu-projeto.supabase.co`
   - Environments: **Production**, **Preview**, **Development**
4. Repita para `VITE_SUPABASE_ANON_KEY` e `VITE_API_URL`
5. **Redeploy** o projeto para aplicar as variáveis

**Via CLI:**
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_API_URL
```

### Netlify

1. Acesse **Site settings** → **Environment variables**
2. Clique em **Add a variable**
3. Adicione cada variável:
   - Key: `VITE_SUPABASE_URL`
   - Value: `https://seu-projeto.supabase.co`
   - Scopes: Selecione todos (Production, Deploy Previews, Branch deploys)
4. Clique em **Save**
5. **Trigger deploy** para reconstruir com as novas variáveis

**Via CLI:**
```bash
netlify env:set VITE_SUPABASE_URL "https://seu-projeto.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "sua_chave_aqui"
netlify env:set VITE_API_URL "https://seu-backend.com"
```

### GitHub Actions / CI/CD

No arquivo `.github/workflows/deploy.yml`, adicione as variáveis como secrets:

```yaml
env:
  VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
  VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
  VITE_API_URL: ${{ secrets.VITE_API_URL }}
```

Adicione os secrets no GitHub:
1. Repositório → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret**
3. Adicione cada variável

### Docker / Render / Railway

Adicione as variáveis de ambiente nas configurações do serviço:

**Docker:**
```dockerfile
# Build args
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_API_URL

# Set as environment variables
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_API_URL=$VITE_API_URL
```

**Build command:**
```bash
docker build \
  --build-arg VITE_SUPABASE_URL=https://seu-projeto.supabase.co \
  --build-arg VITE_SUPABASE_ANON_KEY=sua_chave_aqui \
  --build-arg VITE_API_URL=https://seu-backend.com \
  -t previso-fe .
```

---

## 🔍 Como Obter as Credenciais do Supabase

1. Acesse seu projeto no [Supabase Dashboard](https://app.supabase.com)
2. Vá em **Settings** → **API**
3. Encontre:
   - **Project URL**: Use para `VITE_SUPABASE_URL`
   - **anon public**: Use para `VITE_SUPABASE_ANON_KEY` ✅
   - ~~**service_role secret**~~: **NUNCA use no frontend** ❌

---

## 🧪 Desenvolvimento Local

Crie um arquivo `.env.local` na raiz do projeto:

```bash
# .env.local
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
VITE_API_URL=http://localhost:3000
```

**Importante:**
- `.env.local` é ignorado pelo git (veja `.gitignore`)
- **NUNCA** commite arquivos `.env` com credenciais reais
- Use `.env.example` como template (sem valores reais)

---

## ✅ Verificação de Build

Antes de fazer deploy, teste o build localmente:

```bash
# Com variáveis de ambiente definidas
npm run build

# Verifique se o bundle não contém os nomes das variáveis
grep -r "VITE_SUPABASE" dist/
# Resultado esperado: nenhuma ocorrência ou apenas em comentários
```

Se você encontrar `VITE_SUPABASE_URL` ou `VITE_SUPABASE_ANON_KEY` no bundle compilado, significa que as variáveis não foram definidas durante o build.

---

## 🐛 Troubleshooting

### Erro: "Invalid API key" em produção

**Causa:** Variáveis de ambiente não configuradas na plataforma de deploy.

**Solução:**
1. Verifique se as variáveis foram adicionadas no painel da plataforma
2. Certifique-se de que os nomes estão corretos (incluindo o prefixo `VITE_`)
3. Faça um **redeploy** após adicionar as variáveis
4. Verifique os logs de build para confirmar que as variáveis foram encontradas

### Erro: "Configuração inválida do Supabase"

**Causa:** Variáveis estão undefined ou vazias.

**Solução:**
1. Abra o console do navegador (F12)
2. Procure por logs `[Supabase]` que indicam quais variáveis estão faltando
3. Configure as variáveis conforme as instruções acima

### Build local funciona, mas produção não

**Causa:** As variáveis foram definidas apenas localmente (`.env.local`).

**Solução:**
Configure as variáveis na plataforma de deploy conforme as instruções acima.

### Variáveis aparecem como `undefined` no bundle

**Causa:** Vite só incorpora variáveis com prefixo `VITE_` no build.

**Solução:**
Certifique-se de que todas as variáveis começam com `VITE_`:
- ✅ `VITE_SUPABASE_URL`
- ❌ `SUPABASE_URL`
- ❌ `REACT_APP_SUPABASE_URL` (esse é para Create React App, não Vite)

---

## 📚 Referências

- [Vite - Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Supabase - Getting Started](https://supabase.com/docs/guides/getting-started)
- [Vercel - Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Netlify - Environment Variables](https://docs.netlify.com/environment-variables/overview/)

---

## 🔒 Checklist de Segurança

Antes de fazer deploy para produção:

- [ ] Variáveis de ambiente configuradas na plataforma de deploy
- [ ] Usando `VITE_SUPABASE_ANON_KEY` (chave pública) ✅
- [ ] **NÃO** usando `SUPABASE_SERVICE_KEY` no frontend ❌
- [ ] Arquivo `.env.local` está no `.gitignore`
- [ ] Nenhum arquivo `.env` com credenciais foi commitado
- [ ] Build local sem variáveis falha com erro claro
- [ ] Logs de segurança no console aparecem corretamente
- [ ] Testado em ambiente de staging antes de produção
