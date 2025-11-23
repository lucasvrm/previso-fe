# Frontend Diagnostic Guide

## Overview

Este documento descreve os estados, mensagens de erro e fluxos de tratamento implementados no frontend da aplicação Previso para garantir uma experiência de usuário robusta e informativa.

## Sistema de Classificação de Erros

### `apiErrorClassifier.js`

Utilitário centralizado para classificação e tratamento de erros de API.

#### Tipos de Erro (Error Kinds)

| Kind | Status HTTP | Descrição | Retryable | Mensagem para Usuário |
|------|------------|-----------|-----------|----------------------|
| `network` | 0 | Erro de rede/conexão | ✅ Sim | "Erro de conexão. Verifique sua internet e tente novamente." |
| `cors` | N/A | Falha CORS ou TypeError sem response | ✅ Sim | "Falha de comunicação (CORS/rede). Verifique se o backend está acessível." |
| `unauth` | 401 | Não autenticado/sessão expirada | ❌ Não | "Sessão expirada. Por favor, faça login novamente." |
| `forbidden` | 403 | Sem permissão | ❌ Não | "Você não tem permissão para realizar esta ação." |
| `not_found` | 404 | Recurso não encontrado | ❌ Não | "Recurso não encontrado." |
| `validation` | 422 | Dados inválidos | ❌ Não | "Dados inválidos. Verifique os campos e tente novamente." |
| `server` | 500, 502, 503, 504 | Erro no servidor | ✅ Sim | "Erro no servidor. Tente novamente mais tarde." |
| `unknown` | Outros | Erro desconhecido | ❌ Não | "Ocorreu um erro. Tente novamente." |

#### Funções Disponíveis

```javascript
// Classificar erro
const classifiedError = classifyApiError(err);
// Retorna: { kind, status, detail, userMessage, originalError }

// Obter mensagem amigável
const message = getUserMessage('network');

// Verificar se é retryable
const canRetry = isRetryable(classifiedError);

// Logar erro (apenas em desenvolvimento)
logError(classifiedError, 'ContextName');
```

## Hooks Customizados

### `useAdminStats`

Gerencia estatísticas administrativas com cache e retry automático.

#### Estados

- **loading**: `boolean` - Carregando dados
- **data**: `{ totalUsers, totalCheckins }` - Dados carregados
- **error**: `string` - Mensagem de erro amigável
- **errorType**: `'unauthorized' | 'forbidden' | 'server' | 'network' | 'cors'`

#### Funcionalidades

- ✅ Verifica sessão antes de fazer request
- ✅ Cache de 5 segundos para evitar chamadas redundantes
- ✅ Redirect automático para login em 401
- ✅ Retry configurável (padrão: 3 tentativas)
- ✅ Telemetria de performance

#### Uso

```javascript
const { data, loading, error, errorType, retry, refetch } = useAdminStats({
  enabled: true,  // fetch automático no mount
  maxRetries: 3   // tentativas de retry
});

// Retry com cache check
retry();

// Force refetch (ignora cache)
refetch();
```

### `useLatestCheckin`

Busca o último check-in de um usuário com distinção clara entre "sem dados" e "erro".

#### Estados Possíveis

```javascript
state: 'loading' | 'ok' | 'no_data' | 'error'
```

| Estado | Descrição | UI Sugerida |
|--------|-----------|-------------|
| `loading` | Carregando dados | Spinner |
| `ok` | Dados disponíveis | Exibir dados |
| `no_data` | Nenhum check-in encontrado (404 ou vazio) | Mensagem informativa |
| `error` | Erro ao buscar (network, server, CORS) | Mensagem de erro |

#### Uso

```javascript
const { data, state, error, refresh, isLoading, hasData, hasError, isEmpty } = 
  useLatestCheckin(userId);

if (isLoading) return <Spinner />;
if (isEmpty) return <NoDataMessage />;
if (hasError) return <ErrorMessage error={error} />;
return <CheckinDisplay data={data} />;
```

### `usePredictions`

Busca predições com retry automático e estados claros.

#### Estados

Mesma estrutura de `useLatestCheckin`: `'loading' | 'ok' | 'no_data' | 'error'`

#### Funcionalidades

- ✅ Normaliza resposta (array ou objeto com `.predictions`)
- ✅ Retry exponencial (1s, 2s, 4s) para erros retryable
- ✅ Máximo 3 tentativas antes de falhar definitivamente
- ✅ Telemetria de performance

#### Uso

```javascript
const { data, state, error, retry, isLoading, hasData, hasError, isEmpty } = 
  usePredictions(userId, ['mood', 'energy'], 3);
```

### `useDailyPrediction`

Hook dedicado para predições diárias usando a API de IA.

#### Estados

```javascript
state: 'loading' | 'ok' | 'no_data' | 'error'
```

| Estado | Quando | UI |
|--------|--------|-----|
| `loading` | Inicial ou refetch | LoadingSpinner |
| `ok` | Predição disponível | Exibir resultado |
| `no_data` | 204 No Content ou resposta vazia | NoDataMessage |
| `error` | Falha na API | ErrorMessage |

#### Uso

```javascript
const features = {
  energyLevel: 5,
  depressedMood: 3,
  activation: 4,
  hoursSlept: 7
};

const { prediction, state, error, retry } = useDailyPrediction(features, userId);

if (state === 'loading') return <LoadingSpinner />;
if (state === 'no_data') return <NoDataMessage />;
if (state === 'error') return <ErrorMessage error={error} />;
return <PredictionDisplay prediction={prediction} />;
```

## Componentes

### `DailyPredictionCard`

Exibe predição diária usando `useDailyPrediction`.

#### Estados Visuais

1. **Loading**: Spinner com texto "Analisando dados..."
2. **No Data**: Card azul com ícone TrendingUp e mensagem informativa
3. **Error**: Card vermelho com ícone AlertCircle e mensagem específica do erro
4. **Success**: Card branco com estado previsto, barra de probabilidade e porcentagem

### `DataGenerator`

Gera dados sintéticos com exibição de estatísticas reais.

#### Validação de Formulário

- Todos os campos obrigatórios validados por `react-hook-form`
- Quantidade de pacientes: 0-100
- Quantidade de terapeutas: 0-50
- Número de dias: 1-365

#### Exibição de Estatísticas

Após geração bem-sucedida, exibe:
- ✅ Pacientes criados
- ✅ Terapeutas criados
- ✅ Check-ins totais
- ✅ IDs de usuários (primeiros 3 + contagem)

### `DataCleanup`

Limpeza de dados de teste com validação de payload.

#### Fluxo

1. Botão "Limpar Dados de Teste"
2. Modal de confirmação com aviso
3. Validação de payload `{ confirm: true }`
4. Chamada à API
5. Tratamento de erros específicos:
   - 422: Parâmetros inválidos
   - 401: Sessão expirada
   - 403: Sem permissão
   - 500: Erro no servidor

## Telemetria e Performance

### Métricas Coletadas (Desenvolvimento)

```javascript
console.debug('[Telemetry] adminStatsLoadMs=250');
console.debug('[Telemetry] latestCheckinLoadMs=150');
console.debug('[Telemetry] predictionsLoadMs=320');
console.debug('[Telemetry] dailyPredictionLoadMs=450');
console.debug('[Telemetry] dataGenerationMs=1200');
console.debug('[Telemetry] cleanupMs=800');
```

### Limites Esperados

| Operação | Tempo Normal | Ação se > 1000ms |
|----------|--------------|------------------|
| Admin Stats | < 300ms | Verificar backend/rede |
| Latest Checkin | < 200ms | Verificar backend |
| Predictions | < 500ms | Otimizar query |
| Daily Prediction | < 600ms | Verificar API IA |
| Data Generation | 500-2000ms | Normal (depende da quantidade) |
| Cleanup | < 1000ms | Verificar volume de dados |

## Mensagens de Erro Específicas

### CORS

**Detecção**: TypeError sem status ou response

**Mensagem**: "Falha de comunicação (CORS/rede). Verifique se o backend está acessível."

**Ação do Usuário**: Verificar se VITE_API_URL está correto e se o backend permite CORS

### Chave de API Inválida

**Detecção**: Status 500 + `details.type === 'INVALID_API_KEY'`

**Mensagem**: "Erro de configuração do servidor (chave de API inválida)."

**Ação**: Toast crítico + mensagem inline

### JSON Inválido

**Detecção**: Status 500 + `details.type === 'INVALID_JSON'`

**Mensagem**: "Resposta inválida do servidor."

### Sessão Expirada

**Detecção**: Status 401

**Ação**: 
1. Mensagem: "Sessão expirada. Por favor, faça login novamente."
2. `supabase.auth.signOut()`
3. Redirect para `/login`

## Fluxo de Tratamento de Erros

```
Error Occurs
    ↓
classifyApiError(err)
    ↓
Determine Kind + Status
    ↓
isRetryable(error)?
    ├─ Yes → Retry Logic (exponential backoff)
    └─ No  → Show Error to User
         ↓
    unauth? → Redirect to Login
    cors?   → Show CORS message
    server? → Check specific type
    validation? → Show field errors
```

## Prevenção de Loops Infinitos

### Admin Stats

- ✅ Cache de 5 segundos (`lastFetchTime`)
- ✅ Skip fetch se dados recentes
- ✅ `refetch()` força nova busca ignorando cache

### Predictions com Retry

- ✅ Máximo 3 tentativas
- ✅ Exponential backoff (1s, 2s, 4s)
- ✅ Retry apenas para erros retryable

## Testes

### Cobertura

- ✅ 226 testes passando
- ✅ apiErrorClassifier: 27 testes
- ✅ useDailyPrediction: 11 testes
- ✅ useAdminStats: atualizado
- ✅ usePredictions: atualizado
- ✅ useLatestCheckin: compatibilidade backward
- ✅ DataGenerator: atualizado
- ✅ DataCleanup: atualizado

### Cenários Testados

1. ✅ Respostas 200, 204, 401, 403, 404, 422, 500
2. ✅ Erros de rede (status 0)
3. ✅ Erros CORS (TypeError)
4. ✅ Retry automático
5. ✅ Cache e anti-loop
6. ✅ Estados: loading, ok, no_data, error
7. ✅ Validação de formulários
8. ✅ Exibição de estatísticas

## Checklist de Debug

### Admin Stats mostra 0

- [ ] Verificar se backend retorna `total_users` e `total_checkins`
- [ ] Verificar no Network tab se response contém dados
- [ ] Limpar cache: usar `refetch()` em vez de `retry()`
- [ ] Verificar session válida

### Daily Prediction falha

- [ ] Verificar `VITE_API_URL` no .env
- [ ] Verificar features extraídas do latestCheckin
- [ ] Verificar se API `/predict/state` está acessível
- [ ] Check CORS headers no backend
- [ ] Verificar logs do console (telemetria)

### Cleanup retorna 422

- [ ] Verificar payload: `{ confirm: true }`
- [ ] Verificar que não há campos adicionais obrigatórios
- [ ] Check mensagem específica no erro

### Múltiplas chamadas redundantes

- [ ] useAdminStats: verificar `lastFetchTime`
- [ ] usePredictions: verificar metricsKey memoization
- [ ] Verificar se componente não está re-renderizando desnecessariamente

## Configuração de Ambiente

### Variáveis Requeridas

```bash
# Frontend (.env)
VITE_API_URL=https://bipolar-engine.onrender.com
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Opcional para AI predictions (usa VITE_API_URL se não definido)
VITE_AI_API_URL=https://your-ai-api.com
```

### Verificação

```javascript
// Em desenvolvimento, verificar console
console.debug('[useDailyPrediction] Using API URL:', import.meta.env.VITE_API_URL);
```

## Contribuindo

Ao adicionar novos endpoints ou hooks:

1. ✅ Usar `classifyApiError` para tratamento
2. ✅ Adicionar telemetria (console.debug em dev)
3. ✅ Implementar estados claros (loading, ok, no_data, error)
4. ✅ Escrever testes para cenários de sucesso e falha
5. ✅ Documentar novos estados neste arquivo
6. ✅ Evitar loops: implementar cache ou debounce se necessário
