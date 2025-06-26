import React from 'react';
import apiService, { Group, GroupCreateRequest } from '../services/apiService';

interface GroupFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (group: Partial<Group>) => void;
  initialGroup?: Partial<Group>;
}

const initialFormState: Partial<Group> = {
  name: '',
  displayName: '',
  description: '',
};

function GroupForm({ open, onClose, onSubmit, initialGroup }: GroupFormProps) {
  const [form, setForm] = React.useState<Partial<Group>>(initialGroup || initialFormState);
  React.useEffect(() => {
    setForm(initialGroup || initialFormState);
  }, [initialGroup, open]);
  if (!open) return null;
  const isEdit = Boolean(initialGroup && initialGroup.id);
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">{isEdit ? 'Edit Group' : 'Create Group'}</h2>
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

const GroupManagement: React.FC<{ onOperationComplete: () => void }> = ({ onOperationComplete }) => {
  const [groups, setGroups] = React.useState<Group[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [editingGroup, setEditingGroup] = React.useState<Group | undefined>(undefined);
  const [deletingGroup, setDeletingGroup] = React.useState<Group | undefined>(undefined);

  const fetchGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getGroups();
      setGroups(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreate = () => {
    setEditingGroup(undefined);
    setShowForm(true);
  };

  const handleEdit = (group: Group) => {
    setEditingGroup(group);
    setShowForm(true);
  };

  const handleDelete = (group: Group) => {
    setDeletingGroup(group);
  };

  const handleFormSubmit = async (form: Partial<Group>) => {
    try {
      if (editingGroup) {
        await apiService.updateGroup(editingGroup.id, form);
      } else {
        const { name = '', displayName = '', description = '' } = form;
        const payload: GroupCreateRequest = { name, displayName, description };
        await apiService.createGroup(payload);
      }
      setShowForm(false);
      fetchGroups();
      onOperationComplete();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save group');
    }
  };

  const confirmDelete = async () => {
    if (!deletingGroup) return;
    try {
      await apiService.deleteGroup(deletingGroup.id);
      setDeletingGroup(undefined);
      fetchGroups();
      onOperationComplete();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete group');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading groups...</p>
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
        <button onClick={handleCreate} className="px-4 py-2 bg-green-600 text-white rounded">Create Group</button>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Display Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
            <th className="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {groups.map((group) => (
            <tr key={group.id} className="bg-white">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {group.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{group.displayName || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{group.description || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {group.createdAt ? new Date(group.createdAt).toLocaleDateString() : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onClick={() => handleEdit(group)} className="text-green-600 hover:underline mr-2">Edit</button>
                <button onClick={() => handleDelete(group)} className="text-red-600 hover:underline">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showForm && (
        <GroupForm
          open={showForm}
          onClose={() => setShowForm(false)}
          onSubmit={handleFormSubmit}
          initialGroup={editingGroup}
        />
      )}
      {deletingGroup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete group <b>{deletingGroup.name}</b>?</p>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setDeletingGroup(undefined)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupManagement; 