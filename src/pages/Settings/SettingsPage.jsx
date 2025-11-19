// src/pages/Settings/SettingsPage.jsx
// (ATUALIZADO: Importa o hook de 'src/hooks/useAuth.jsx')

import React, { useState } from 'react';
import { supabase } from '../../api/supabaseClient'; 
import { Send } from 'lucide-react'; 
// (NÃO USA O useAuth(), então não precisa mudar)

const SettingsPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleInvite = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data, error: funcError } = await supabase.functions.invoke(
        'invite-therapist', 
        { body: { therapist_email: email } }
      );

      setLoading(false);

      if (funcError) {
        console.error("Erro ao invocar função:", funcError);
        setError("Erro ao enviar o convite. Tente novamente.");
      } else if (data?.error) {
        setError(data.error);
      } else {
        setSuccess(data?.message || 'Terapeuta convidado com sucesso!');
        setEmail(''); 
      }
    } catch (err) {
      console.error("Erro na requisição:", err);
      setLoading(false);
      setError("Erro ao enviar o convite. Verifique sua conexão.");
    }
  };

  return (
    <div className="w-full space-y-8">
      <div className="bg-card p-6 rounded-lg border shadow-sm max-w-2xl"> 
        <h2 className="text-xl font-semibold text-foreground mb-4">Convidar seu Terapeuta</h2>
        <p className="text-muted-foreground mb-6">
          Insira o e-mail do terapeuta cadastrado no Previso para que ele possa 
          visualizar seu histórico e gráficos.
        </p>
        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label htmlFor="therapist-email" className="block text-sm font-medium text-muted-foreground mb-1">
              Email do Terapeuta
            </label>
            <input
              id="therapist-email" type="email" placeholder="email@terapeuta.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full p-3 bg-background border rounded-md focus:ring-2 focus:ring-ring focus:outline-none"
            />
          </div>
          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          {success && <p className="text-sm font-medium text-green-600">{success}</p>}
          <button 
            type="submit" disabled={loading}
            className="flex items-center justify-center px-6 py-2 bg-primary text-primary-foreground rounded-md font-semibold 
                       hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Enviando...' : (<><Send className="h-4 w-4 mr-2" /> Enviar Convite</>)}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;