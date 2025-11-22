# Previso - Frontend

Sistema de previsão e acompanhamento de saúde mental.

## 🚀 Quick Start

### Pré-requisitos

- Node.js 16+ 
- npm ou yarn
- Conta no Supabase

### Instalação

```bash
# Clone o repositório
git clone https://github.com/lucasvrm/previso-fe.git
cd previso-fe

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais do Supabase
```

### Configuração

Crie um arquivo `.env.local` na raiz do projeto:

```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
VITE_API_URL=http://localhost:3000
```

⚠️ **IMPORTANTE**: Veja [DEPLOYMENT.md](./DEPLOYMENT.md) para instruções completas sobre configuração de variáveis de ambiente em produção.

### Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build de produção
npm run preview

# Executar testes
npm test

# Executar linter
npm run lint
```

## 🔐 Segurança

- **NUNCA** use `SUPABASE_SERVICE_KEY` no frontend
- Use apenas `VITE_SUPABASE_ANON_KEY` (chave pública)
- Não commite arquivos `.env` com credenciais reais

## 📚 Documentação

- [Guia de Deploy](./DEPLOYMENT.md) - Instruções completas para deploy em produção
- [Testing Guide](./TESTING.md) - Informações sobre testes

## 🛠️ Tecnologias

- React 19
- Vite 7
- Supabase
- React Router
- Tailwind CSS
- Jest + Testing Library

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run preview` - Preview do build
- `npm test` - Executa testes
- `npm run test:watch` - Executa testes em modo watch
- `npm run test:coverage` - Gera relatório de cobertura
- `npm run lint` - Executa ESLint
- `npm run cypress:open` - Abre Cypress para testes E2E
- `npm run cypress:run` - Executa testes E2E em headless

## 🐛 Troubleshooting

### Erro "Invalid API key"

Se você receber este erro, verifique:
1. As variáveis de ambiente estão configuradas?
2. Os nomes das variáveis estão corretos (com prefixo `VITE_`)?
3. Em produção, as variáveis foram configuradas na plataforma de deploy?

Veja [DEPLOYMENT.md](./DEPLOYMENT.md) para instruções detalhadas.

## 📄 Licença

Este projeto está sob licença privada.
