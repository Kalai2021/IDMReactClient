import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';
import { useLogger } from '../hooks/useLogger';
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
  const logger = useLogger('Dashboard');
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
      logger.info('Fetching dashboard stats');
      
      const [users, groups, organizations, roles] = await Promise.all([
        apiService.getUsers().catch(() => []),
        apiService.getGroups().catch(() => []),
        apiService.getOrganizations().catch(() => []),
        apiService.getRoles().catch(() => [])
      ]);

      const newStats = {
        users: Array.isArray(users) ? users.length : 0,
        groups: Array.isArray(groups) ? groups.length : 0,
        organizations: Array.isArray(organizations) ? organizations.length : 0,
        roles: Array.isArray(roles) ? roles.length : 0
      };

      setStats(newStats);
      
      logger.info('Dashboard stats updated', {
        stats: newStats,
        userId: user?.id
      });
    } catch (error) {
      logger.error('Error fetching dashboard stats', error instanceof Error ? error : undefined);
      // Keep default values if API calls fail
    } finally {
      setStatsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      logger.userAction('logout_clicked', {
        userId: user?.id,
        userEmail: user?.email
      });
      
      await logout();
      
      logger.info('User logged out successfully', {
        userId: user?.id,
        userEmail: user?.email
      });
    } catch (error) {
      logger.error('Logout error', error instanceof Error ? error : undefined);
    }
  };

  const handleOperationComplete = () => {
    logger.info('Management operation completed, refreshing stats');
    fetchStats(); // Refresh stats after operation
  };

  const handleManagementSelect = (managementId: string) => {
    logger.userAction('management_section_selected', {
      managementId,
      managementTitle: managementBoxes.find(box => box.id === managementId)?.title,
      userId: user?.id
    });
    
    setSelectedManagement(managementId);
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
                    onClick={() => handleManagementSelect(box.id)}
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

          {/* Stats Section */}
          {!selectedManagement && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Statistics</h3>
              {statsLoading ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.users}</div>
                    <div className="text-sm text-gray-600">Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.groups}</div>
                    <div className="text-sm text-gray-600">Groups</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.organizations}</div>
                    <div className="text-sm text-gray-600">Organizations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{stats.roles}</div>
                    <div className="text-sm text-gray-600">Roles</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Management Component */}
          {renderManagementComponent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 