// src/pages/Admin/UsersSection.jsx
// Users management section for Admin Console

import React, { useState, useEffect } from 'react';
import { api } from '../../api/apiClient';
import { Plus, Search, Loader2, AlertCircle } from 'lucide-react';
import UsersList from '../../components/Admin/Users/UsersList';
import CreateUserModal from '../../components/Admin/Users/CreateUserModal';

const UsersSection = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({
    role: 'all',
    isTestPatient: 'all',
    source: 'all'
  });

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query params from filters
      const params = new URLSearchParams();
      if (filters.role !== 'all') params.append('role', filters.role);
      if (filters.isTestPatient !== 'all') params.append('is_test_patient', filters.isTestPatient);
      if (filters.source !== 'all') params.append('source', filters.source);
      if (searchTerm) params.append('search', searchTerm);

      const queryString = params.toString();
      const endpoint = `/api/admin/users${queryString ? `?${queryString}` : ''}`;
      
      const data = await api.get(endpoint);
      setUsers(data.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters, searchTerm]);

  const handleUserCreated = () => {
    setShowCreateModal(false);
    fetchUsers();
  };

  const handleUserUpdated = () => {
    fetchUsers();
  };

  const handleUserDeleted = () => {
    fetchUsers();
  };

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por email ou username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        {/* Create User Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Criar Usuário
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label htmlFor="role-filter" className="block text-sm font-medium text-muted-foreground mb-1">
            Papel
          </label>
          <select
            id="role-filter"
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            className="px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
          >
            <option value="all">Todos</option>
            <option value="patient">Paciente</option>
            <option value="therapist">Terapeuta</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div>
          <label htmlFor="test-filter" className="block text-sm font-medium text-muted-foreground mb-1">
            Tipo
          </label>
          <select
            id="test-filter"
            value={filters.isTestPatient}
            onChange={(e) => setFilters({ ...filters, isTestPatient: e.target.value })}
            className="px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
          >
            <option value="all">Todos</option>
            <option value="true">Teste</option>
            <option value="false">Real</option>
          </select>
        </div>

        <div>
          <label htmlFor="source-filter" className="block text-sm font-medium text-muted-foreground mb-1">
            Origem
          </label>
          <select
            id="source-filter"
            value={filters.source}
            onChange={(e) => setFilters({ ...filters, source: e.target.value })}
            className="px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
          >
            <option value="all">Todas</option>
            <option value="seed">Seed</option>
            <option value="synthetic">Sintético</option>
            <option value="manual">Manual</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive rounded-md">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-sm text-destructive-foreground">{error}</p>
        </div>
      )}

      {/* Users List */}
      {!loading && !error && (
        <UsersList 
          users={users} 
          onUserUpdated={handleUserUpdated}
          onUserDeleted={handleUserDeleted}
        />
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onUserCreated={handleUserCreated}
        />
      )}
    </div>
  );
};

export default UsersSection;
