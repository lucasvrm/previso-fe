// vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // se seu frontend estiver em /src, isso isola de vez supabase/
  // (se o index.html estiver na raiz, tira o root)
  // root: 'src',

  plugins: [
    react({
      // Filtro do plugin React (React Fast Refresh, JSX transform, etc)
      // Isso só desliga o plugin nesses arquivos
      exclude: ['**/supabase/**'],
    }),
  ],

  // Se em algum momento você importar algo por engano de supabase/ no FE,
  // isso já barra o bundle:
  build: {
    rollupOptions: {
      // não é obrigatório, mas ajuda a garantir isolamento lógico
      external: id => id.includes('/supabase/'),
    },
  },

  // Opcional: otimização de deps não tenta “pré-bundlar” nada com esse nome
  optimizeDeps: {
    exclude: ['supabase'],
  },
})
