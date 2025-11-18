import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Settings, BarChart3 } from 'lucide-react';

const Sidebar = () => {
  // Estilo base para os links
  const linkStyle = "flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group";
  
  // Estilo para o link ativo (quando a rota corresponde)
  const activeLinkStyle = {
    backgroundColor: '#e5e7eb', // um cinza claro para indicar atividade
  };

  return (
    <aside className="w-64 h-screen" aria-label="Sidebar">
      <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800">
        <NavLink to="/dashboard" className="flex items-center ps-2.5 mb-5">
          <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Previso</span>
        </NavLink>
        <ul className="space-y-2 font-medium">
          <li>
            <NavLink 
              to="/dashboard" 
              className={linkStyle}
              style={({ isActive }) => isActive ? activeLinkStyle : undefined}
            >
              <Home className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              <span className="ms-3">Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/checkin" 
              className={linkStyle}
              style={({ isActive }) => isActive ? activeLinkStyle : undefined}
            >
              <BarChart3 className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              <span className="flex-1 ms-3 whitespace-nowrap">Check-in</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/settings" 
              className={linkStyle}
              style={({ isActive }) => isActive ? activeLinkStyle : undefined}
            >
              <Settings className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              <span className="flex-1 ms-3 whitespace-nowrap">Configurações</span>
            </NavLink>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;