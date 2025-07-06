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
    const startTime = Date.now();
    try {
      const response = await this.api.get('/users');
      const duration = Date.now() - startTime;
      
      logger.apiCall('/users', 'GET', response.status, duration);
      
      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      const err: any = error;
      logger.apiCall('/users', 'GET', err.response?.status || 0, duration, error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async getUser(id: string): Promise<User> {
    const startTime = Date.now();
    try {
      const response = await this.api.get(`/users/${id}`);
      const duration = Date.now() - startTime;
      
      logger.apiCall(`/users/${id}`, 'GET', response.status, duration);
      
      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      const err: any = error;
      logger.apiCall(`/users/${id}`, 'GET', err.response?.status || 0, duration, error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async createUser(userData: UserCreateRequest): Promise<User> {
    const startTime = Date.now();
    try {
      const response = await this.api.post('/users', userData);
      const duration = Date.now() - startTime;
      
      logger.apiCall('/users', 'POST', response.status, duration);
      
      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      const err: any = error;
      logger.apiCall('/users', 'POST', err.response?.status || 0, duration, error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async updateUser(id: string, userData: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>): Promise<User> {
    const startTime = Date.now();
    try {
      const response = await this.api.put(`/users/${id}`, userData);
      const duration = Date.now() - startTime;
      
      logger.apiCall(`/users/${id}`, 'PUT', response.status, duration);
      
      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      const err: any = error;
      logger.apiCall(`/users/${id}`, 'PUT', err.response?.status || 0, duration, error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    const startTime = Date.now();
    try {
      const response = await this.api.delete(`/users/${id}`);
      const duration = Date.now() - startTime;
      
      logger.apiCall(`/users/${id}`, 'DELETE', response.status, duration);
      
      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      const err: any = error;
      logger.apiCall(`/users/${id}`, 'DELETE', err.response?.status || 0, duration, error instanceof Error ? error : undefined);
      throw error;
    }
  }

  // Group API calls
  async getGroups(): Promise<Group[]> {
    const startTime = Date.now();
    try {
      const response = await this.api.get('/groups');
      const duration = Date.now() - startTime;
      
      logger.apiCall('/groups', 'GET', response.status, duration);
      
      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      const err: any = error;
      logger.apiCall('/groups', 'GET', err.response?.status || 0, duration, error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async getGroup(id: string): Promise<Group> {
    const startTime = Date.now();
    try {
      const response = await this.api.get(`/groups/${id}`);
      const duration = Date.now() - startTime;
      
      logger.apiCall(`/groups/${id}`, 'GET', response.status, duration);
      
      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      const err: any = error;
      logger.apiCall(`/groups/${id}`, 'GET', err.response?.status || 0, duration, error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async createGroup(groupData: GroupCreateRequest): Promise<Group> {
    const startTime = Date.now();
    try {
      const response = await this.api.post('/groups', groupData);
      const duration = Date.now() - startTime;
      
      logger.apiCall('/groups', 'POST', response.status, duration);
      
      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      const err: any = error;
      logger.apiCall('/groups', 'POST', err.response?.status || 0, duration, error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async updateGroup(id: string, groupData: Partial<Omit<Group, 'id' | 'created_at' | 'updated_at'>>): Promise<Group> {
    const startTime = Date.now();
    try {
      const response = await this.api.put(`/groups/${id}`, groupData);
      const duration = Date.now() - startTime;
      
      logger.apiCall(`/groups/${id}`, 'PUT', response.status, duration);
      
      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      const err: any = error;
      logger.apiCall(`/groups/${id}`, 'PUT', err.response?.status || 0, duration, error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async deleteGroup(id: string): Promise<void> {
    const startTime = Date.now();
    try {
      const response = await this.api.delete(`/groups/${id}`);
      const duration = Date.now() - startTime;
      
      logger.apiCall(`/groups/${id}`, 'DELETE', response.status, duration);
      
      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      const err: any = error;
      logger.apiCall(`/groups/${id}`, 'DELETE', err.response?.status || 0, duration, error instanceof Error ? error : undefined);
      throw error;
    }
  }

  // Organization API calls
  async getOrganizations(): Promise<Organization[]> {
    const startTime = Date.now();
    try {
      const response = await this.api.get('/organizations');
      const duration = Date.now() - startTime;
      
      logger.apiCall('/organizations', 'GET', response.status, duration);
      
      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      const err: any = error;
      logger.apiCall('/organizations', 'GET', err.response?.status || 0, duration, error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async getOrganization(id: string): Promise<Organization> {
    const startTime = Date.now();
    try {
      const response = await this.api.get(`/organizations/${id}`);
      const duration = Date.now() - startTime;
      
      logger.apiCall(`/organizations/${id}`, 'GET', response.status, duration);
      
      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      const err: any = error;
      logger.apiCall(`/organizations/${id}`, 'GET', err.response?.status || 0, duration, error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async createOrganization(orgData: Omit<Organization, 'id' | 'created_at' | 'updated_at'>): Promise<Organization> {
    const startTime = Date.now();
    try {
      const response = await this.api.post('/organizations', orgData);
      const duration = Date.now() - startTime;
      
      logger.apiCall('/organizations', 'POST', response.status, duration);
      
      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      const err: any = error;
      logger.apiCall('/organizations', 'POST', err.response?.status || 0, duration, error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async updateOrganization(id: string, orgData: Partial<Omit<Organization, 'id' | 'created_at' | 'updated_at'>>): Promise<Organization> {
    const startTime = Date.now();
    try {
      const response = await this.api.put(`/organizations/${id}`, orgData);
      const duration = Date.now() - startTime;
      
      logger.apiCall(`/organizations/${id}`, 'PUT', response.status, duration);
      
      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      const err: any = error;
      logger.apiCall(`/organizations/${id}`, 'PUT', err.response?.status || 0, duration, error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async deleteOrganization(id: string): Promise<void> {
    const startTime = Date.now();
    try {
      const response = await this.api.delete(`/organizations/${id}`);
      const duration = Date.now() - startTime;
      
      logger.apiCall(`/organizations/${id}`, 'DELETE', response.status, duration);
      
      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      const err: any = error;
      logger.apiCall(`/organizations/${id}`, 'DELETE', err.response?.status || 0, duration, error instanceof Error ? error : undefined);
      throw error;
    }
  }

  // Role API calls
  async getRoles(): Promise<Role[]> {
    const startTime = Date.now();
    try {
      const response = await this.api.get('/roles');
      const duration = Date.now() - startTime;
      
      logger.apiCall('/roles', 'GET', response.status, duration);
      
      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      const err: any = error;
      logger.apiCall('/roles', 'GET', err.response?.status || 0, duration, error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async getRole(id: string): Promise<Role> {
    const startTime = Date.now();
    try {
      const response = await this.api.get(`/roles/${id}`);
      const duration = Date.now() - startTime;
      
      logger.apiCall(`/roles/${id}`, 'GET', response.status, duration);
      
      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      const err: any = error;
      logger.apiCall(`/roles/${id}`, 'GET', err.response?.status || 0, duration, error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async createRole(roleData: RoleCreateRequest): Promise<Role> {
    const startTime = Date.now();
    try {
      const response = await this.api.post('/roles', roleData);
      const duration = Date.now() - startTime;
      
      logger.apiCall('/roles', 'POST', response.status, duration);
      
      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      const err: any = error;
      logger.apiCall('/roles', 'POST', err.response?.status || 0, duration, error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async updateRole(id: string, roleData: Partial<Omit<Role, 'id' | 'created_at' | 'updated_at'>>): Promise<Role> {
    const startTime = Date.now();
    try {
      const response = await this.api.put(`/roles/${id}`, roleData);
      const duration = Date.now() - startTime;
      
      logger.apiCall(`/roles/${id}`, 'PUT', response.status, duration);
      
      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      const err: any = error;
      logger.apiCall(`/roles/${id}`, 'PUT', err.response?.status || 0, duration, error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async deleteRole(id: string): Promise<void> {
    const startTime = Date.now();
    try {
      const response = await this.api.delete(`/roles/${id}`);
      const duration = Date.now() - startTime;
      
      logger.apiCall(`/roles/${id}`, 'DELETE', response.status, duration);
      
      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      const err: any = error;
      logger.apiCall(`/roles/${id}`, 'DELETE', err.response?.status || 0, duration, error instanceof Error ? error : undefined);
      throw error;
    }
  }
}

// Create singleton instance
const apiService = new ApiService();
export default apiService; 