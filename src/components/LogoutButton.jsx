import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

const LogoutButton = () => {
    const { signOut, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Erro ao fazer logout', error);
        } finally {
            // Always navigate to login, even if logout had an error
            navigate('/login');
        }
    };
    
    // Se não há usuário, não renderiza nada.
    if (!user) return null;

    return (
        <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-md font-medium hover:bg-destructive/90 transition-colors"
        >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sair</span>
        </button>
    );
};

export default LogoutButton;