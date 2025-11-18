import React from 'react';
// CORREÇÃO: Atualizando o caminho do import para o hook
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
    const { signOut, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut();
            navigate('/login');
        } catch (error) {
            console.error('Erro ao fazer logout', error);
        }
    };
    
    // Se não há usuário, não renderiza nada.
    if (!user) return null;

    return (
        <button 
            onClick={handleLogout} 
            style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
            Sair
        </button>
    );
};

// PONTO CRÍTICO DA CORREÇÃO: Usando "export default"
export default LogoutButton;