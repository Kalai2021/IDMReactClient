import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import customAuthService from './customAuthService';
import logger from './logger';

// TypeScript interfaces for data structures
export interface User {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Organization {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Role {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  permissions?: string[];
  createdAt: string;
  updatedAt?: string;
}

export type UserCreateRequest = {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  password: string;
};

export type GroupCreateRequest = {
  name: string;
  displayName: string;
  description?: string;
};

export type RoleCreateRequest = {
  name: string;
  displayName: string;
  description?: string;
};

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/v1`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = customAuthService.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, redirect to login
          customAuthService.removeUser();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // User API calls
  async getUsers(): Promise<User[]> {
    try {
      const startTime = Date.now();
      const response = await this.api.get('/users');
      const duration = Date.now() - startTime;
      
      logger.logInfo('Users retrieved successfully', {
        count: response.data?.length || 0,
        duration,
        timestamp: new Date().toISOString()
      });
      
      return response.data;
    } catch (error) {
      logger.logError('Failed to retrieve users', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async getUser(id: string): Promise<User> {
    try {
      const startTime = Date.now();
      const response = await this.api.get(`/users/${id}`);
      const duration = Date.now() - startTime;
      
      logger.logInfo('User retrieved successfully', {
        userId: id,
        duration,
        timestamp: new Date().toISOString()
      });
      
      return response.data;
    } catch (error) {
      logger.logError('Failed to retrieve user', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async createUser(userData: UserCreateRequest): Promise<User> {
    try {
      const startTime = Date.now();
      const response = await this.api.post('/users', userData);
      const duration = Date.now() - startTime;
      
      logger.logInfo('User created successfully', {
        userId: response.data?.id,
        email: userData.email,
        duration,
        timestamp: new Date().toISOString()
      });
      
      return response.data;
    } catch (error) {
      logger.logError('Failed to create user', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async updateUser(id: string, userData: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>): Promise<User> {
    try {
      const startTime = Date.now();
      const response = await this.api.put(`/users/${id}`, userData);
      const duration = Date.now() - startTime;
      
      logger.logInfo('User updated successfully', {
        userId: id,
        duration,
        timestamp: new Date().toISOString()
      });
      
      return response.data;
    } catch (error) {
      logger.logError('Failed to update user', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      const startTime = Date.now();
      const response = await this.api.delete(`/users/${id}`);
      const duration = Date.now() - startTime;
      
      logger.logInfo('User deleted successfully', {
        userId: id,
        duration,
        timestamp: new Date().toISOString()
      });
      
      return response.data;
    } catch (error) {
      logger.logError('Failed to delete user', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  // Group API calls
  async getGroups(): Promise<Group[]> {
    try {
      const startTime = Date.now();
      const response = await this.api.get('/groups');
      const duration = Date.now() - startTime;
      
      logger.logInfo('Groups retrieved successfully', {
        count: response.data?.length || 0,
        duration,
        timestamp: new Date().toISOString()
      });
      
      return response.data;
    } catch (error) {
      logger.logError('Failed to retrieve groups', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async getGroup(id: string): Promise<Group> {
    try {
      const startTime = Date.now();
      const response = await this.api.get(`/groups/${id}`);
      const duration = Date.now() - startTime;
      
      logger.logInfo('Group retrieved successfully', {
        groupId: id,
        duration,
        timestamp: new Date().toISOString()
      });
      
      return response.data;
    } catch (error) {
      logger.logError('Failed to retrieve group', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async createGroup(groupData: GroupCreateRequest): Promise<Group> {
    try {
      const startTime = Date.now();
      const response = await this.api.post('/groups', groupData);
      const duration = Date.now() - startTime;
      
      logger.logInfo('Group created successfully', {
        groupId: response.data?.id,
        groupName: groupData.name,
        duration,
        timestamp: new Date().toISOString()
      });
      
      return response.data;
    } catch (error) {
      logger.logError('Failed to create group', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async updateGroup(id: string, groupData: Partial<Omit<Group, 'id' | 'created_at' | 'updated_at'>>): Promise<Group> {
    try {
      const startTime = Date.now();
      const response = await this.api.put(`/groups/${id}`, groupData);
      const duration = Date.now() - startTime;
      
      logger.logInfo('Group updated successfully', {
        groupId: id,
        duration,
        timestamp: new Date().toISOString()
      });
      
      return response.data;
    } catch (error) {
      logger.logError('Failed to update group', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async deleteGroup(id: string): Promise<void> {
    try {
      const startTime = Date.now();
      const response = await this.api.delete(`/groups/${id}`);
      const duration = Date.now() - startTime;
      
      logger.logInfo('Group deleted successfully', {
        groupId: id,
        duration,
        timestamp: new Date().toISOString()
      });
      
      return response.data;
    } catch (error) {
      logger.logError('Failed to delete group', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  // Organization API calls
  async getOrganizations(): Promise<Organization[]> {
    try {
      const startTime = Date.now();
      const response = await this.api.get('/organizations');
      const duration = Date.now() - startTime;
      
      logger.logInfo('Organizations retrieved successfully', {
        count: response.data?.length || 0,
        duration,
        timestamp: new Date().toISOString()
      });
      
      return response.data;
    } catch (error) {
      logger.logError('Failed to retrieve organizations', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async getOrganization(id: string): Promise<Organization> {
    try {
      const startTime = Date.now();
      const response = await this.api.get(`/organizations/${id}`);
      const duration = Date.now() - startTime;
      
      logger.logInfo('Organization retrieved successfully', {
        orgId: id,
        duration,
        timestamp: new Date().toISOString()
      });
      
      return response.data;
    } catch (error) {
      logger.logError('Failed to retrieve organization', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async createOrganization(orgData: Omit<Organization, 'id' | 'created_at' | 'updated_at'>): Promise<Organization> {
    try {
      const startTime = Date.now();
      const response = await this.api.post('/organizations', orgData);
      const duration = Date.now() - startTime;
      
      logger.logInfo('Organization created successfully', {
        orgId: response.data?.id,
        orgName: orgData.name,
        duration,
        timestamp: new Date().toISOString()
      });
      
      return response.data;
    } catch (error) {
      logger.logError('Failed to create organization', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async updateOrganization(id: string, orgData: Partial<Omit<Organization, 'id' | 'created_at' | 'updated_at'>>): Promise<Organization> {
    try {
      const startTime = Date.now();
      const response = await this.api.put(`/organizations/${id}`, orgData);
      const duration = Date.now() - startTime;
      
      logger.logInfo('Organization updated successfully', {
        orgId: id,
        duration,
        timestamp: new Date().toISOString()
      });
      
      return response.data;
    } catch (error) {
      logger.logError('Failed to update organization', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async deleteOrganization(id: string): Promise<void> {
    try {
      const startTime = Date.now();
      const response = await this.api.delete(`/organizations/${id}`);
      const duration = Date.now() - startTime;
      
      logger.logInfo('Organization deleted successfully', {
        orgId: id,
        duration,
        timestamp: new Date().toISOString()
      });
      
      return response.data;
    } catch (error) {
      logger.logError('Failed to delete organization', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  // Role API calls
  async getRoles(): Promise<Role[]> {
    try {
      const startTime = Date.now();
      const response = await this.api.get('/roles');
      const duration = Date.now() - startTime;
      
      logger.logInfo('Roles retrieved successfully', {
        count: response.data?.length || 0,
        duration,
        timestamp: new Date().toISOString()
      });
      
      return response.data;
    } catch (error) {
      logger.logError('Failed to retrieve roles', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async getRole(id: string): Promise<Role> {
    try {
      const startTime = Date.now();
      const response = await this.api.get(`/roles/${id}`);
      const duration = Date.now() - startTime;
      
      logger.logInfo('Role retrieved successfully', {
        roleId: id,
        duration,
        timestamp: new Date().toISOString()
      });
      
      return response.data;
    } catch (error) {
      logger.logError('Failed to retrieve role', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async createRole(roleData: RoleCreateRequest): Promise<Role> {
    try {
      const startTime = Date.now();
      const response = await this.api.post('/roles', roleData);
      const duration = Date.now() - startTime;
      
      logger.logInfo('Role created successfully', {
        roleId: response.data?.id,
        roleName: roleData.name,
        duration,
        timestamp: new Date().toISOString()
      });
      
      return response.data;
    } catch (error) {
      logger.logError('Failed to create role', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async updateRole(id: string, roleData: Partial<Omit<Role, 'id' | 'created_at' | 'updated_at'>>): Promise<Role> {
    try {
      const startTime = Date.now();
      const response = await this.api.put(`/roles/${id}`, roleData);
      const duration = Date.now() - startTime;
      
      logger.logInfo('Role updated successfully', {
        roleId: id,
        duration,
        timestamp: new Date().toISOString()
      });
      
      return response.data;
    } catch (error) {
      logger.logError('Failed to update role', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async deleteRole(id: string): Promise<void> {
    try {
      const startTime = Date.now();
      const response = await this.api.delete(`/roles/${id}`);
      const duration = Date.now() - startTime;
      
      logger.logInfo('Role deleted successfully', {
        roleId: id,
        duration,
        timestamp: new Date().toISOString()
      });
      
      return response.data;
    } catch (error) {
      logger.logError('Failed to delete role', error instanceof Error ? error : undefined);
      throw error;
    }
  }
}

// Create singleton instance
const apiService = new ApiService();
export default apiService; 