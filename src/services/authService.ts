import { UserManager, User, WebStorageStateStore } from 'oidc-client-ts';

export interface AuthConfig {
  authority: string;
  client_id: string;
  redirect_uri: string;
  response_type: string;
  scope: string;
  post_logout_redirect_uri: string;
}

class AuthService {
  private userManager: UserManager;
  private user: User | null = null;

  constructor() {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
    const config = {
      authority: API_URL,
      client_id: 'react-app',
      redirect_uri: 'http://localhost:3000/callback',
      response_type: 'code',
      scope: 'openid profile email',
      post_logout_redirect_uri: 'http://localhost:3000',
      loadUserInfo: false,
      monitorSession: false,
      stateStore: new WebStorageStateStore({ store: window.localStorage }),
      // Disable automatic metadata loading since we have a custom implementation
      metadata: {
        authorization_endpoint: `${API_URL}/api/v1/auth/pkce/authorize`,
        token_endpoint: `${API_URL}/api/v1/auth/pkce/token`,
        jwks_uri: `${API_URL}/api/v1/auth/pkce/jwks`,
        issuer: API_URL,
        response_types_supported: ['code'],
        subject_types_supported: ['public'],
        id_token_signing_alg_values_supported: ['HS256'],
        scopes_supported: ['openid', 'profile', 'email'],
        token_endpoint_auth_methods_supported: ['none'],
        claims_supported: ['sub', 'email'],
      },
    };

    this.userManager = new UserManager(config);
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.userManager.events.addUserLoaded((user) => {
      this.user = user;
      console.log('User loaded:', user);
    });

    this.userManager.events.addUserUnloaded(() => {
      this.user = null;
      console.log('User unloaded');
    });

    this.userManager.events.addAccessTokenExpiring(() => {
      console.log('Access token expiring');
    });

    this.userManager.events.addAccessTokenExpired(() => {
      console.log('Access token expired');
      this.signoutRedirect();
    });

    this.userManager.events.addSilentRenewError((error) => {
      console.error('Silent renew error:', error);
    });
  }

  async signinRedirect(): Promise<void> {
    try {
      console.log('Starting signin redirect...');
      await this.userManager.signinRedirect();
    } catch (error) {
      console.error('Signin redirect error:', error);
      throw error;
    }
  }

  async signinRedirectCallback(): Promise<User> {
    try {
      console.log('Processing signin redirect callback...');
      const user = await this.userManager.signinRedirectCallback();
      this.user = user;
      console.log('Signin callback successful:', user);
      return user;
    } catch (error) {
      console.error('Signin redirect callback error:', error);
      throw error;
    }
  }

  async signoutRedirect(): Promise<void> {
    try {
      await this.userManager.signoutRedirect();
    } catch (error) {
      console.error('Signout redirect error:', error);
      throw error;
    }
  }

  async signoutRedirectCallback(): Promise<void> {
    try {
      await this.userManager.signoutRedirectCallback();
    } catch (error) {
      console.error('Signout redirect callback error:', error);
      throw error;
    }
  }

  async getUser(): Promise<User | null> {
    try {
      if (!this.user) {
        this.user = await this.userManager.getUser();
      }
      return this.user;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getUser();
    return user !== null && !user.expired;
  }

  async getAccessToken(): Promise<string | null> {
    const user = await this.getUser();
    return user?.access_token || null;
  }

  async removeUser(): Promise<void> {
    try {
      await this.userManager.removeUser();
      this.user = null;
    } catch (error) {
      console.error('Remove user error:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
export default authService; 