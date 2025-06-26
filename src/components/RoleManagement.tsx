import React from 'react';
import apiService, { Role, RoleCreateRequest } from '../services/apiService';

interface RoleFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (role: Partial<Role>) => void;
  initialRole?: Partial<Role>;
}

const initialFormState: Partial<Role> = {
  name: '',
  displayName: '',
  description: '',
};

function RoleForm({ open, onClose, onSubmit, initialRole }: RoleFormProps) {
  const [form, setForm] = React.useState<Partial<Role>>(initialRole || initialFormState);
  React.useEffect(() => {
    setForm(initialRole || initialFormState);
  }, [initialRole, open]);
  if (!open) return null;
  const isEdit = Boolean(initialRole && initialRole.id);
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">{isEdit ? 'Edit Role' : 'Create Role'}</h2>
        <form onSubmit={e => { e.preventDefault(); onSubmit(form); }}>
          <div className="mb-2">
            <label className="block text-sm">Name</label>
            <input className="w-full border rounded px-2 py-1" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="mb-2">
            <label className="block text-sm">Display Name</label>
            <input className="w-full border rounded px-2 py-1" value={form.displayName || ''} onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))} required />
          </div>
          <div className="mb-2">
            <label className="block text-sm">Description</label>
            <input className="w-full border rounded px-2 py-1" value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" className="px-3 py-1 bg-gray-200 rounded" onClick={onClose}>Cancel</button>
            <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">{isEdit ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const RoleManagement: React.FC<{ onOperationComplete: () => void }> = ({ onOperationComplete }) => {
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [editingRole, setEditingRole] = React.useState<Role | undefined>(undefined);
  const [deletingRole, setDeletingRole] = React.useState<Role | undefined>(undefined);

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getRoles();
      setRoles(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchRoles();
  }, []);

  const handleCreate = () => {
    setEditingRole(undefined);
    setShowForm(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setShowForm(true);
  };

  const handleDelete = (role: Role) => {
    setDeletingRole(role);
  };

  const handleFormSubmit = async (form: Partial<Role>) => {
    try {
      if (editingRole) {
        await apiService.updateRole(editingRole.id, form);
      } else {
        const { name = '', displayName = '', description = '' } = form;
        const payload: RoleCreateRequest = { name, displayName, description };
        await apiService.createRole(payload);
      }
      setShowForm(false);
      fetchRoles();
      onOperationComplete();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save role');
    }
  };

  const confirmDelete = async () => {
    if (!deletingRole) return;
    try {
      await apiService.deleteRole(deletingRole.id);
      setDeletingRole(undefined);
      fetchRoles();
      onOperationComplete();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete role');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading roles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-end mb-2">
        <button onClick={handleCreate} className="px-4 py-2 bg-orange-600 text-white rounded">Create Role</button>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Display Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
            <th className="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {roles.map((role) => (
            <tr key={role.id} className="bg-white">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {role.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.displayName || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.description || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {role.createdAt ? new Date(role.createdAt).toLocaleDateString() : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onClick={() => handleEdit(role)} className="text-orange-600 hover:underline mr-2">Edit</button>
                <button onClick={() => handleDelete(role)} className="text-red-600 hover:underline">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showForm && (
        <RoleForm
          open={showForm}
          onClose={() => setShowForm(false)}
          onSubmit={handleFormSubmit}
          initialRole={editingRole}
        />
      )}
      {deletingRole && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete role <b>{deletingRole.name}</b>?</p>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setDeletingRole(undefined)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagement; 