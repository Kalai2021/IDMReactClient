import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import customAuthService from './customAuthService';

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
    const response = await this.api.get('/users');
    return response.data;
  }

  async getUser(id: string): Promise<User> {
    const response = await this.api.get(`/users/${id}`);
    return response.data;
  }

  async createUser(userData: UserCreateRequest): Promise<User> {
    const response = await this.api.post('/users', userData);
    return response.data;
  }

  async updateUser(id: string, userData: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>): Promise<User> {
    const response = await this.api.put(`/users/${id}`, userData);
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    const response = await this.api.delete(`/users/${id}`);
    return response.data;
  }

  // Group API calls
  async getGroups(): Promise<Group[]> {
    const response = await this.api.get('/groups');
    return response.data;
  }

  async getGroup(id: string): Promise<Group> {
    const response = await this.api.get(`/groups/${id}`);
    return response.data;
  }

  async createGroup(groupData: GroupCreateRequest): Promise<Group> {
    const response = await this.api.post('/groups', groupData);
    return response.data;
  }

  async updateGroup(id: string, groupData: Partial<Omit<Group, 'id' | 'created_at' | 'updated_at'>>): Promise<Group> {
    const response = await this.api.put(`/groups/${id}`, groupData);
    return response.data;
  }

  async deleteGroup(id: string): Promise<void> {
    const response = await this.api.delete(`/groups/${id}`);
    return response.data;
  }

  // Organization API calls
  async getOrganizations(): Promise<Organization[]> {
    const response = await this.api.get('/organizations');
    return response.data;
  }

  async getOrganization(id: string): Promise<Organization> {
    const response = await this.api.get(`/organizations/${id}`);
    return response.data;
  }

  async createOrganization(orgData: Omit<Organization, 'id' | 'created_at' | 'updated_at'>): Promise<Organization> {
    const response = await this.api.post('/organizations', orgData);
    return response.data;
  }

  async updateOrganization(id: string, orgData: Partial<Omit<Organization, 'id' | 'created_at' | 'updated_at'>>): Promise<Organization> {
    const response = await this.api.put(`/organizations/${id}`, orgData);
    return response.data;
  }

  async deleteOrganization(id: string): Promise<void> {
    const response = await this.api.delete(`/organizations/${id}`);
    return response.data;
  }

  // Role API calls
  async getRoles(): Promise<Role[]> {
    const response = await this.api.get('/roles');
    return response.data;
  }

  async getRole(id: string): Promise<Role> {
    const response = await this.api.get(`/roles/${id}`);
    return response.data;
  }

  async createRole(roleData: RoleCreateRequest): Promise<Role> {
    const response = await this.api.post('/roles', roleData);
    return response.data;
  }

  async updateRole(id: string, roleData: Partial<Omit<Role, 'id' | 'created_at' | 'updated_at'>>): Promise<Role> {
    const response = await this.api.put(`/roles/${id}`, roleData);
    return response.data;
  }

  async deleteRole(id: string): Promise<void> {
    const response = await this.api.delete(`/roles/${id}`);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService; 