import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';
import UserManagement from './UserManagement';
import GroupManagement from './GroupManagement';
import OrganizationManagement from './OrganizationManagement';
import RoleManagement from './RoleManagement';

interface ManagementBox {
  id: string;
  title: string;
  description: string;
  color: string;
  operations: string[];
}

interface Stats {
  users: number;
  groups: number;
  organizations: number;
  roles: number;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [selectedManagement, setSelectedManagement] = useState<string>('');
  const [stats, setStats] = useState<Stats>({
    users: 0,
    groups: 0,
    organizations: 0,
    roles: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const managementBoxes: ManagementBox[] = [
    {
      id: 'userMgmt',
      title: 'User Management',
      description: 'Manage user accounts, profiles, and permissions',
      color: 'bg-blue-500 hover:bg-blue-600',
      operations: ['Create', 'Update', 'Delete', 'List', 'Lookup']
    },
    {
      id: 'groupMgmt',
      title: 'Group Management',
      description: 'Organize users into groups and manage group policies',
      color: 'bg-green-500 hover:bg-green-600',
      operations: ['Create', 'Update', 'Delete', 'List', 'Lookup']
    },
    {
      id: 'orgMgmt',
      title: 'Organization Management',
      description: 'Manage organizational structure and hierarchy',
      color: 'bg-purple-500 hover:bg-purple-600',
      operations: ['Create', 'Update', 'Delete', 'List', 'Lookup']
    },
    {
      id: 'roleMgmt',
      title: 'Role Management',
      description: 'Define and assign roles and permissions',
      color: 'bg-orange-500 hover:bg-orange-600',
      operations: ['Create', 'Update', 'Delete', 'List', 'Lookup']
    }
  ];

  // Fetch stats on component mount
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const [users, groups, organizations, roles] = await Promise.all([
        apiService.getUsers().catch(() => []),
        apiService.getGroups().catch(() => []),
        apiService.getOrganizations().catch(() => []),
        apiService.getRoles().catch(() => [])
      ]);

      setStats({
        users: Array.isArray(users) ? users.length : 0,
        groups: Array.isArray(groups) ? groups.length : 0,
        organizations: Array.isArray(organizations) ? organizations.length : 0,
        roles: Array.isArray(roles) ? roles.length : 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Keep default values if API calls fail
    } finally {
      setStatsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleOperationComplete = () => {
    fetchStats(); // Refresh stats after operation
  };

  const renderManagementComponent = () => {
    switch (selectedManagement) {
      case 'userMgmt':
        return (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Management</h3>
            <UserManagement onOperationComplete={handleOperationComplete} />
          </div>
        );
      case 'groupMgmt':
        return (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Group Management</h3>
            <GroupManagement onOperationComplete={handleOperationComplete} />
          </div>
        );
      case 'orgMgmt':
        return (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization Management</h3>
            <OrganizationManagement onOperationComplete={handleOperationComplete} />
          </div>
        );
      case 'roleMgmt':
        return (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Management</h3>
            <RoleManagement onOperationComplete={handleOperationComplete} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">IDM Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user?.email || 'User'}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Identity Management System</h2>
            <p className="text-gray-600">Select a management area to get started</p>
          </div>

          {/* Management Boxes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {managementBoxes.map((box) => (
              <div
                key={box.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className={`w-12 h-12 ${box.color} rounded-lg flex items-center justify-center mb-4`}>
                    <span className="text-white font-bold text-lg">
                      {box.title.charAt(0)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{box.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{box.description}</p>
                  <button
                    className={`w-full px-3 py-2 rounded-md text-white font-medium ${box.color}`}
                    onClick={() => setSelectedManagement(box.id)}
                  >
                    {box.id === 'userMgmt' && 'Manage Users'}
                    {box.id === 'groupMgmt' && 'Manage Groups'}
                    {box.id === 'orgMgmt' && 'Manage Organizations'}
                    {box.id === 'roleMgmt' && 'Manage Roles'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Management Component Display */}
          {selectedManagement && renderManagementComponent()}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-lg p-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  {statsLoading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                  ) : (
                    <p className="text-2xl font-semibold text-gray-900">{stats.users.toLocaleString()}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="bg-green-100 rounded-lg p-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Groups</p>
                  {statsLoading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                  ) : (
                    <p className="text-2xl font-semibold text-gray-900">{stats.groups.toLocaleString()}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="bg-purple-100 rounded-lg p-3">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Organizations</p>
                  {statsLoading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                  ) : (
                    <p className="text-2xl font-semibold text-gray-900">{stats.organizations.toLocaleString()}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="bg-orange-100 rounded-lg p-3">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Roles</p>
                  {statsLoading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                  ) : (
                    <p className="text-2xl font-semibold text-gray-900">{stats.roles.toLocaleString()}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 