import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Settings, BarChart3, User, UserCog, FileText, LogOut, Brain, TrendingUp, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Sidebar = () => {
  const { user, userRole, logout } = useAuth();
  const navigate = useNavigate();

  // Determine which icon to use based on role
  const UserIcon = userRole === 'therapist' ? UserCog : User;

  // Get display name for role
  const getRoleLabel = () => {
    if (!userRole) return 'Usuário';
    if (userRole === 'therapist') return 'Terapeuta';
    if (userRole === 'patient') return 'Paciente';
    return userRole;
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      // Always navigate to login, even if logout had an error
      navigate('/login');
    }
  };

  return (
    <aside className="w-64 h-screen bg-card border-r border-border flex flex-col" aria-label="Sidebar">
      <div className="flex-1 px-3 py-4 overflow-y-auto">
        <NavLink to="/dashboard" className="flex items-center ps-2.5 mb-5">
          <span className="self-center text-xl font-semibold whitespace-nowrap text-foreground">
            Previso
          </span>
        </NavLink>
        <ul className="space-y-2 font-medium">
          <li>
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) =>
                `flex items-center p-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
              }
            >
              <Home className="w-5 h-5" />
              <span className="ms-3">Dashboard</span>
            </NavLink>
          </li>
          {userRole === 'patient' && (
            <li>
              <NavLink 
                to="/checkin" 
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`
                }
              >
                <BarChart3 className="w-5 h-5" />
                <span className="flex-1 ms-3 whitespace-nowrap">Check-in</span>
              </NavLink>
            </li>
          )}
          {(userRole === 'patient' || userRole === 'therapist') && (
            <li>
              <NavLink 
                to="/analyses" 
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`
                }
              >
                <Brain className="w-5 h-5" />
                <span className="flex-1 ms-3 whitespace-nowrap">Análises</span>
              </NavLink>
            </li>
          )}
          {userRole === 'therapist' && (
            <li>
              <NavLink 
                to="/therapist/reports" 
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`
                }
              >
                <FileText className="w-5 h-5" />
                <span className="flex-1 ms-3 whitespace-nowrap">Relatórios</span>
              </NavLink>
            </li>
          )}
          <li>
            <NavLink 
              to="/trends" 
              className={({ isActive }) =>
                `flex items-center p-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
              }
            >
              <TrendingUp className="w-5 h-5" />
              <span className="flex-1 ms-3 whitespace-nowrap">Radar de Tendências</span>
            </NavLink>
          </li>
          {userRole === 'admin' && (
            <li>
              <NavLink 
                to="/admin" 
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`
                }
              >
                <Shield className="w-5 h-5" />
                <span className="flex-1 ms-3 whitespace-nowrap">Console Admin</span>
              </NavLink>
            </li>
          )}
          <li>
            <NavLink 
              to="/settings" 
              className={({ isActive }) =>
                `flex items-center p-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
              }
            >
              <Settings className="w-5 h-5" />
              <span className="flex-1 ms-3 whitespace-nowrap">Configurações</span>
            </NavLink>
          </li>
        </ul>
      </div>
      
      {/* User info and logout footer */}
      <div className="px-3 py-4 border-t border-border space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <UserIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.email || 'Usuário'}
            </p>
            <p className="text-xs text-muted-foreground">
              {getRoleLabel()}
            </p>
          </div>
        </div>
        
        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center p-3 rounded-lg transition-colors text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
        >
          <LogOut className="w-5 h-5" />
          <span className="ms-3 font-medium">Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;