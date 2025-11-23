# ROADMAP: Frontend Admin Role Determination via Backend

## Executive Summary

**Status**: ✅ CONCLUÍDO  
**Data**: 2025-11-23  
**Branch**: `copilot/adjust-admin-route-sidebar-role`

Este roadmap documenta a implementação completa da correção de determinação de role de administrador via backend `/api/profile`, substituindo a abordagem anterior que priorizava o Supabase REST.

---

## Objetivos Solicitados

### Requisitos Principais

1. **AuthContext**: Ajustar para determinar role via backend (`/api/profile`), não via `user_metadata` do JWT ou Supabase
2. **Fallback Robusto**: Se Supabase REST falhar (500/recursão), usar `/api/profile` sem loops infinitos
3. **AdminRoute**: Usar `profile.role` do contexto para verificar acesso (`profileRole === 'admin'`)
4. **Sidebar**: Exibir dashboards e rotas conforme `role` do backend
5. **Configuração**: Ter `API_BASE` configurável via env (não expor `SERVICE_ROLE` no frontend)
6. **Medições**: Registrar estado "antes" e "depois" em `diagnostics/`
7. **Testes**: Atualizar testes para considerar source de role do backend

---

## O Que Foi Implementado

### 1. ✅ AuthContext (`src/contexts/AuthContext.jsx`)

**Mudança Fundamental**: Invertemos a prioridade de fonte de dados

**ANTES**:
```javascript
1. Tentar Supabase profiles (SELECT)
2. Se falhar → Tentar /api/profile (fallback)
```

**DEPOIS**:
```javascript
1. Tentar /api/profile (PRIORITY - source of truth)
2. Se falhar → Tentar Supabase profiles (fallback)
```

**Implementação**:
```javascript
const fetchUserProfile = async (userId) => {
  // Get session for API authentication
  const { data: { session } } = await supabase.auth.getSession();
  
  // PRIORITY: Fetch from backend API (source of truth for role)
  try {
    const { api } = await import('../api/apiClient');
    const apiProfileData = await api.get('/api/profile');
    
    setProfile(apiProfileData);
    setUserRole(apiProfileData?.role || null);
    return; // Success - backend is authoritative
  } catch (apiError) {
    // FALLBACK: Try Supabase as backup
    const { data: profileData, error: supabaseError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (supabaseError) {
      throw new Error('Não foi possível carregar o perfil do usuário');
    }
    
    setProfile(profileData);
    setUserRole(profileData?.role || null);
  }
}
```

**Benefícios**:
- ✅ Role sempre vem do backend quando disponível (fonte de verdade)
- ✅ Fallback para Supabase previne falha total
- ✅ Sem loops infinitos - para após ambas as fontes falharem
- ✅ Logs claros explicando qual fonte foi usada

---

### 2. ✅ AdminRoute (`src/components/AdminRoute.jsx`)

**Mudança Fundamental**: Substituímos `useAdminStats` por verificação direta de role

**ANTES**:
```javascript
import { useAdminStats } from '../hooks/useAdminStats';

const AdminRoute = ({ children }) => {
  const { loading, error, errorType } = useAdminStats({ enabled: true, maxRetries: 1 });
  
  if (errorType === 'forbidden') {
    return <AccessDenied />;
  }
  // ...
}
```

**DEPOIS**:
```javascript
import { useAuth } from '../hooks/useAuth';

const AdminRoute = ({ children }) => {
  const { user, profile, userRole, loading } = useAuth();
  
  // Check if user has admin role from backend profile
  if (userRole !== 'admin') {
    return <AccessDenied />;
  }
  // ...
}
```

**Implementação**:
1. **Loading State**: Aguarda `loading === false` e `profile !== null`
2. **Authentication**: Redireciona para `/login` se `!user`
3. **Authorization**: Verifica `userRole === 'admin'` (backend-sourced)
4. **Access Denied**: Exibe se role não for 'admin'

**Benefícios**:
- ✅ Lógica mais simples e direta
- ✅ Não depende de chamada extra para `/api/admin/stats`
- ✅ Role verificado diretamente do contexto (já carregado)
- ✅ Consistente com fonte de verdade do backend

---

### 3. ✅ Sidebar (`src/components/Sidebar.jsx`)

**Mudança**: Adicionamos label explícito para 'admin'

**ANTES**:
```javascript
const getRoleLabel = () => {
  if (!userRole) return 'Usuário';
  if (userRole === 'therapist') return 'Terapeuta';
  if (userRole === 'patient') return 'Paciente';
  return userRole; // Generic fallback
};
```

**DEPOIS**:
```javascript
// userRole comes from AuthContext, which fetches from backend /api/profile
const getRoleLabel = () => {
  if (!userRole) return 'Usuário';
  if (userRole === 'admin') return 'Admin';
  if (userRole === 'therapist') return 'Terapeuta';
  if (userRole === 'patient') return 'Paciente';
  return userRole;
};
```

**Menu Admin**:
```javascript
{userRole === 'admin' && (
  <li>
    <NavLink to="/admin">
      <Shield className="w-5 h-5" />
      <span>Console Admin</span>
    </NavLink>
  </li>
)}
```

**Benefícios**:
- ✅ Label "Admin" exibido quando `userRole === 'admin'`
- ✅ Menu do Admin Console só aparece para admins (backend-sourced)
- ✅ Comentário clarifica que role vem do backend

---

### 4. ✅ Configuração de Ambiente

**Arquivo**: `.env.example`

**Configuração Existente**:
```bash
# Backend API URL
VITE_API_URL=https://bipolar-engine.onrender.com
```

**Uso no Código** (`src/utils/apiConfig.js`):
```javascript
export const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || 'https://bipolar-engine.onrender.com';
};
```

**Observações**:
- ✅ `VITE_API_URL` já configurado (não precisa adicionar `VITE_API_BASE`)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` NÃO exposto no frontend (correto)
- ✅ Frontend usa apenas `VITE_SUPABASE_ANON_KEY` (seguro)

---

### 5. ✅ Testes Atualizados

**Arquivo**: `tests/components/AdminRoute.test.js`

**ANTES**: Mockava `useAdminStats`
```javascript
jest.mock('../../src/hooks/useAdminStats', () => ({
  useAdminStats: jest.fn(),
}));

test('should show Access Denied when forbidden', () => {
  useAdminStats.mockReturnValue({ 
    loading: false, 
    error: 'Forbidden', 
    errorType: 'forbidden' 
  });
  // ...
});
```

**DEPOIS**: Mocka `useAuth`
```javascript
jest.mock('../../src/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

test('should show Access Denied when user does not have admin role', () => {
  useAuth.mockReturnValue({ 
    user: { id: '123', email: 'user@example.com' }, 
    profile: { id: '123', role: 'patient' }, 
    userRole: 'patient', 
    loading: false 
  });
  // ...
});
```

**Casos de Teste Adicionados/Atualizados**:
1. ✅ `should show loading when auth is loading`
2. ✅ `should show loading when profile is not yet loaded`
3. ✅ `should render children when user has admin role`
4. ✅ `should show Access Denied when user does not have admin role`
5. ✅ `should redirect to login when no user is logged in`
6. ✅ `should show Access Denied for therapist role`

**Resultado**: 6 testes passando (era 5 antes)

---

## Medições: ANTES vs DEPOIS

### Testes

| Métrica | ANTES | DEPOIS | Mudança |
|---------|-------|--------|---------|
| Total de testes | 234 | 235 | +1 |
| Testes falhando | 0 | 0 | ✅ |
| Test suites | 24 | 24 | - |
| AdminRoute tests | 5 | 6 | +1 |

### Lint

| Métrica | ANTES | DEPOIS |
|---------|-------|--------|
| Status | OK | OK |
| Warnings | 1 | 1 |
| Errors | 0 | 0 |

*Nota: Warning em `useLatestCheckin.js` não relacionado a esta task*

### Arquitetura

| Aspecto | ANTES | DEPOIS |
|---------|-------|--------|
| **Fonte de Role** | Supabase profiles (primário) <br> /api/profile (fallback) | /api/profile (primário) <br> Supabase (fallback) |
| **AdminRoute** | Chama `/api/admin/stats` via `useAdminStats` | Usa `userRole` do `AuthContext` |
| **Verificação de Admin** | Status HTTP (403 = forbidden) | Role direto: `userRole === 'admin'` |
| **Número de Requests** | 2 (profile + admin stats) | 1 (profile apenas) |
| **Risco de Loop** | Alto (se Supabase 500) | Baixo (para após 2 tentativas) |

---

## O Que Ficou de Fora

### Não Implementado (Não Solicitado)

1. **Context API para Admin Stats**: Poderia compartilhar stats entre componentes, mas não foi solicitado
2. **Retry UI**: Botão "Tentar novamente" em caso de erro de profile load
3. **Offline Support**: Detecção de modo offline e queue de ações
4. **Error Tracking**: Integração com Sentry ou similar
5. **Loading Skeleton**: Loading state mais elaborado com skeletons
6. **Profile Refresh Button**: Botão manual para forçar atualização de profile

### Fora do Escopo (Backend)

1. **Endpoint `/api/profile`**: Assume que já existe e retorna `{ id, role, email, ... }`
2. **RLS Policies**: Políticas do Supabase não foram alteradas
3. **Backend Role Management**: Lógica de atribuição de role permanece no backend

---

## Como Validar

### 1. Validação Local (Dev)

```bash
# 1. Instalar dependências
npm install

# 2. Configurar .env
cp .env.example .env
# Editar VITE_API_URL para apontar para backend

# 3. Rodar lints
npm run lint
# Deve passar com 1 warning (não relacionado)

# 4. Rodar testes
npm test
# Deve passar 235/235 testes

# 5. Rodar app em dev
npm run dev
# Abrir em http://localhost:5173
```

### 2. Validação de Fluxo de Autenticação

**Cenário 1: Login como Patient**
1. Fazer login com conta de paciente
2. ✅ Deve carregar profile de `/api/profile`
3. ✅ Sidebar NÃO deve mostrar "Console Admin"
4. ✅ Acessar `/admin` deve mostrar "Access Denied"

**Cenário 2: Login como Admin**
1. Fazer login com conta admin (role='admin' no backend)
2. ✅ Deve carregar profile de `/api/profile`
3. ✅ Sidebar deve mostrar label "Admin"
4. ✅ Sidebar deve ter link "Console Admin"
5. ✅ Acessar `/admin` deve funcionar

**Cenário 3: Backend Offline (Fallback)**
1. Desligar backend ou simular erro 500
2. ✅ AuthContext deve tentar Supabase como fallback
3. ✅ Se Supabase tiver role, deve funcionar (degraded mode)
4. ✅ Não deve entrar em loop infinito

**Cenário 4: Ambos Offline**
1. Desligar backend E bloquear RLS do Supabase
2. ✅ Deve mostrar erro claro no console
3. ✅ Profile e userRole devem ficar `null`
4. ✅ Não deve crashar a aplicação

### 3. Validação de Logs

**Console do Browser** (Dev Mode):
```
[AuthContext] Fetch user profile
[AuthContext] Perfil carregado via API backend: { id: '...', role: 'admin', ... }
```

**Se Backend Falhar**:
```
[AuthContext] Erro ao buscar perfil via API backend: ...
[AuthContext] Tentando fallback: buscar via Supabase...
[AuthContext] Perfil carregado via Supabase (fallback): { ... }
```

**Se Ambos Falharem**:
```
[AuthContext] ⚠️  ATENÇÃO: Não foi possível carregar o perfil do usuário!
[AuthContext] Possíveis causas:
[AuthContext] 1. Backend /api/profile indisponível ou retornando erro
[AuthContext] 2. Política RLS do Supabase está bloqueando o acesso
[AuthContext] 3. Problemas de rede ou autenticação
```

---

## Próximos Passos

### Imediato

1. ✅ **Merge do PR**: Branch `copilot/adjust-admin-route-sidebar-role` pronto para merge
2. ✅ **Deploy**: Após merge, fazer deploy para staging/production
3. ⚠️ **Validar Backend**: Confirmar que endpoint `/api/profile` existe e retorna role correto

### Curto Prazo (Opcional)

1. **Melhorar UX de Erro**:
   - Toast notification quando profile load falhar
   - Botão "Tentar novamente" na Sidebar se role não carregar
   
2. **Loading State Melhorado**:
   - Skeleton loader enquanto profile está carregando
   - Shimmer effect nos componentes que dependem de role

3. **Documentação**:
   - Atualizar `README.md` com fluxo de autenticação/autorização
   - Documentar contrato esperado de `/api/profile`

### Longo Prazo

1. **Audit Log**:
   - Registrar quando admin acessa Console Admin
   - Histórico de mudanças de role

2. **Role Management UI**:
   - Interface para admins alterarem role de usuários
   - Validação e auditoria de mudanças

3. **Feature Flags por Role**:
   - Sistema de feature flags baseado em role
   - A/B testing por tipo de usuário

---

## Critérios de Aceite - Status

| Critério | Status | Evidência |
|----------|--------|-----------|
| Após login, role obtida de `/api/profile` | ✅ | AuthContext prioriza backend |
| Se `profiles.role='admin'`, Sidebar mostra Admin Console | ✅ | `{userRole === 'admin' && ...}` |
| AdminRoute permite acesso se `profileRole === 'admin'` | ✅ | `if (userRole !== 'admin') return <AccessDenied />` |
| Em falhas do Supabase REST, FE usa `/api/profile` | ✅ | Backend é tentado PRIMEIRO |
| Sem loop infinito em caso de erro | ✅ | Para após 2 tentativas (backend + fallback) |
| Lint passando | ✅ | 0 errors, 1 warning não relacionado |
| Testes passando | ✅ | 235/235 testes (100%) |
| `VITE_API_BASE` configurável via env | ✅ | `VITE_API_URL` já existe e funciona |
| `SERVICE_ROLE` não exposto no frontend | ✅ | Apenas `ANON_KEY` usado |

**Resultado**: 9/9 critérios atingidos ✅

---

## Riscos Mitigados

| Risco | Mitigação Implementada |
|-------|------------------------|
| Backend `/api/profile` não existe | ✅ Fallback para Supabase garante funcionamento degradado |
| Loop infinito em erro 500 | ✅ Tenta backend → Supabase → Para (não retenta infinitamente) |
| Role desatualizado no Supabase | ✅ Backend agora é fonte primária (sempre atualizado) |
| Frontend expor secrets | ✅ Usa apenas `ANON_KEY`, nunca `SERVICE_ROLE` |
| Quebra de testes em refactor | ✅ Testes atualizados e todos passando |

---

## Arquivos Modificados

### Criados

1. ✅ `diagnostics/before-frontend.json` - Baseline de medições
2. ✅ `diagnostics/after-frontend.json` - Medições pós-implementação
3. ✅ `ROADMAP_FRONTEND_ROLE_FIX.md` - Este documento

### Modificados

1. ✅ `src/contexts/AuthContext.jsx` - Invertida prioridade (backend first)
2. ✅ `src/components/AdminRoute.jsx` - Usa `useAuth` em vez de `useAdminStats`
3. ✅ `src/components/Sidebar.jsx` - Adicionado label 'Admin'
4. ✅ `tests/components/AdminRoute.test.js` - Testes usando mock de `useAuth`

**Total**: 3 arquivos criados, 4 modificados

---

## Integração com Backend

### Endpoint Esperado

**GET** `/api/profile`

**Headers**:
```
Authorization: Bearer <access_token_from_supabase>
```

**Response 200**:
```json
{
  "id": "uuid-do-usuario",
  "email": "user@example.com",
  "role": "admin",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-15T12:00:00Z"
}
```

**Response 401** (Unauthorized):
```json
{
  "detail": "Token inválido ou expirado"
}
```

**Response 500** (Server Error):
```json
{
  "detail": "Erro interno do servidor"
}
```

**Comportamento do Frontend**:
- **200**: Usa profile retornado (role, email, etc)
- **401**: Tenta Supabase, se falhar → redireciona para login
- **500**: Tenta Supabase como fallback
- **Network Error**: Tenta Supabase como fallback

---

## Conclusão

Este roadmap documenta a implementação completa e bem-sucedida da correção de determinação de role de administrador via backend.

**Principais Conquistas**:
- ✅ AuthContext agora prioriza backend `/api/profile` (fonte de verdade)
- ✅ Fallback robusto para Supabase sem loops infinitos
- ✅ AdminRoute simplificado usando `userRole` do contexto
- ✅ Sidebar exibe "Admin" e Console Admin para admins
- ✅ 235 testes passando (100%)
- ✅ Configuração de ambiente correta e segura
- ✅ Medições "antes" e "depois" documentadas

**Impacto Mensurável**:
- Backend agora é fonte primária de role (era fallback)
- 1 request a menos por carregamento (não precisa chamar `/admin/stats`)
- 0 loops infinitos (garantido por lógica de fallback)
- +1 teste novo (coverage melhorada)

**Status Final**: ✅ PRONTO PARA MERGE

---

**Autor**: GitHub Copilot Agent  
**Data de Conclusão**: 2025-11-23  
**Branch**: `copilot/adjust-admin-route-sidebar-role`  
**Commits**: 2 commits incrementais e testados
