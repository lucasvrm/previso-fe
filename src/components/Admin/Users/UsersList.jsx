// src/components/Admin/Users/UsersList.jsx
// Users list table component

import React, { useState } from 'react';
import { Edit2, Trash2, Eye } from 'lucide-react';
import UserDetailsModal from './UserDetailsModal';
import EditUserModal from './EditUserModal';
import DeleteUserModal from './DeleteUserModal';

const UsersList = ({ users, onUserUpdated, onUserDeleted }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalType, setModalType] = useState(null); // 'details', 'edit', 'delete'

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setModalType('details');
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setModalType('edit');
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setModalType('delete');
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setModalType(null);
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200';
      case 'therapist':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
      case 'patient':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200';
    }
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhum usuário encontrado
      </div>
    );
  }

  return (
    <>
      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Username
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Papel
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Origem
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Criado em
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm text-foreground">
                    {user.email}
                    {user.deleted_at && (
                      <span className="ml-2 text-xs text-red-500">(deletado)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {user.username || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClass(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {user.is_test_patient ? (
                      <span className="text-orange-600 font-medium">Teste</span>
                    ) : (
                      <span className="text-muted-foreground">Real</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {user.source || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : '-'}
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleViewDetails(user)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        title="Deletar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {modalType === 'details' && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={handleCloseModal}
        />
      )}

      {modalType === 'edit' && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={handleCloseModal}
          onUserUpdated={() => {
            handleCloseModal();
            onUserUpdated();
          }}
        />
      )}

      {modalType === 'delete' && selectedUser && (
        <DeleteUserModal
          user={selectedUser}
          onClose={handleCloseModal}
          onUserDeleted={() => {
            handleCloseModal();
            onUserDeleted();
          }}
        />
      )}
    </>
  );
};

export default UsersList;
