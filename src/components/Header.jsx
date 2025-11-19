// src/components/Header.jsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { AlertCircle, Phone, X } from 'lucide-react';

const Header = () => {
  const { logout } = useAuth();
  const [showSOSModal, setShowSOSModal] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('[Header] erro ao fazer logout:', error);
    }
  };

  return (
    <>
      <header className="flex items-center justify-between px-8 py-4 border-b bg-white">
        <div>
          <h1 className="text-lg font-semibold">Previso</h1>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <button
            type="button"
            onClick={() => setShowSOSModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 transition-colors"
          >
            <AlertCircle className="h-4 w-4" />
            SOS / Ajuda
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="text-red-600 text-sm font-semibold hover:underline"
          >
            Sair (Logout)
          </button>
        </div>
      </header>

      {/* SOS Modal */}
      {showSOSModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-red-600" />
                Ajuda de Emergência
              </h2>
              <button
                onClick={() => setShowSOSModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Centro de Valorização da Vida (CVV)
                </h3>
                <p className="text-sm text-red-800 mb-2">
                  Apoio emocional e prevenção do suicídio - 24h por dia, 7 dias por semana
                </p>
                <a 
                  href="tel:188" 
                  className="text-2xl font-bold text-red-600 hover:text-red-700"
                >
                  📞 188
                </a>
                <p className="text-xs text-red-700 mt-1">
                  Ligação gratuita de qualquer telefone
                </p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">
                  SAMU - Serviço de Atendimento Móvel de Urgência
                </h3>
                <a 
                  href="tel:192" 
                  className="text-2xl font-bold text-blue-600 hover:text-blue-700"
                >
                  📞 192
                </a>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-semibold text-yellow-900 mb-2">
                  Orientações Importantes
                </h3>
                <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                  <li>Se você está em crise, não hesite em ligar</li>
                  <li>Procure seu médico ou terapeuta</li>
                  <li>Não tome decisões importantes sozinho</li>
                  <li>Fale com alguém de confiança</li>
                </ul>
              </div>
            </div>

            <div className="p-4 border-t">
              <button
                onClick={() => setShowSOSModal(false)}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md font-medium hover:bg-gray-300 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
