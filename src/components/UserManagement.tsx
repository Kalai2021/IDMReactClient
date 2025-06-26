import React from 'react';
import apiService, { User } from '../services/apiService';

interface UserManagementProps {
  onOperationComplete: () => void;
}

// UserForm component for create/update
const initialFormState: Partial<User> = {
  name: '',
  firstName: '',
  lastName: '',
  email: '',
  isActive: true,
};

function UserForm({ open, onClose, onSubmit, initialUser }: {
  open: boolean;
  onClose: () => void;
  onSubmit: (user: Partial<User> & { password?: string }) => void;
  initialUser?: Partial<User>;
}) {
  const [form, setForm] = React.useState<Partial<User> & { password?: string }>(initialUser || initialFormState);
  React.useEffect(() => {
    setForm(initialUser || initialFormState);
  }, [initialUser, open]);
  if (!open) return null;
  const isEdit = Boolean(initialUser && initialUser.id);
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">{isEdit ? 'Edit User' : 'Create User'}</h2>
        <form onSubmit={e => { e.preventDefault(); onSubmit(form); }}>
          <div className="mb-2">
            <label className="block text-sm">Name</label>
            <input className="w-full border rounded px-2 py-1" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="mb-2">
            <label className="block text-sm">First Name</label>
            <input className="w-full border rounded px-2 py-1" value={form.firstName || ''} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} required />
          </div>
          <div className="mb-2">
            <label className="block text-sm">Last Name</label>
            <input className="w-full border rounded px-2 py-1" value={form.lastName || ''} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} required />
          </div>
          <div className="mb-2">
            <label className="block text-sm">Email</label>
            <input className="w-full border rounded px-2 py-1" type="email" value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          {!isEdit && (
            <div className="mb-2">
              <label className="block text-sm">Password</label>
              <input className="w-full border rounded px-2 py-1" type="password" value={form.password || ''} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={6} />
            </div>
          )}
          <div className="mb-4">
            <label className="block text-sm">Active</label>
            <input type="checkbox" checked={form.isActive ?? true} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
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

const UserManagement: React.FC<UserManagementProps> = ({ onOperationComplete }) => {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | undefined>(undefined);
  const [deletingUser, setDeletingUser] = React.useState<User | undefined>(undefined);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = () => {
    setEditingUser(undefined);
    setShowForm(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleDelete = (user: User) => {
    setDeletingUser(user);
  };

  const handleFormSubmit = async (form: Partial<User> & { password?: string }) => {
    try {
      if (editingUser) {
        await apiService.updateUser(editingUser.id, form);
      } else {
        // Ensure all required fields are present for create
        const { name = '', firstName = '', lastName = '', email = '', isActive = true, password = '' } = form;
        await apiService.createUser({ name, firstName, lastName, email, isActive, password });
      }
      setShowForm(false);
      fetchUsers();
      onOperationComplete();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save user');
    }
  };

  const confirmDelete = async () => {
    if (!deletingUser) return;
    try {
      await apiService.deleteUser(deletingUser.id);
      setDeletingUser(undefined);
      fetchUsers();
      onOperationComplete();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading users...</p>
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
        <button onClick={handleCreate} className="px-4 py-2 bg-blue-600 text-white rounded">Create User</button>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
            <th className="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} className="bg-white">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {user.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.firstName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.lastName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onClick={() => handleEdit(user)} className="text-blue-600 hover:underline mr-2">Edit</button>
                <button onClick={() => handleDelete(user)} className="text-red-600 hover:underline">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showForm && (
        <UserForm
          open={showForm}
          onClose={() => setShowForm(false)}
          onSubmit={handleFormSubmit}
          initialUser={editingUser}
        />
      )}
      {deletingUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete user <b>{deletingUser.name}</b>?</p>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setDeletingUser(undefined)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 