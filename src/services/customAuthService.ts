import { SHA256 } from 'crypto-js';

export interface AuthUser {
  id: string;
  email: string;
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

class CustomAuthService {
  private user: AuthUser | null = null;
  private codeVerifier: string | null = null;

  constructor() {
    // Check if user exists in localStorage
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        this.user = JSON.parse(storedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('auth_user');
      }
    }
  }

  // Generate random string for PKCE
  private generateRandomString(length: number): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let result = '';
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);
    for (let i = 0; i < length; i++) {
      result += charset[randomValues[i] % charset.length];
    }
    return result;
  }

  // Generate PKCE code verifier and challenge
  private async generatePKCE(): Promise<{ codeVerifier: string; codeChallenge: string }> {
    const codeVerifier = this.generateRandomString(128);
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const base64 = btoa(String.fromCharCode.apply(null, hashArray));
    const codeChallenge = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    console.log('Generated PKCE:', { codeVerifier, codeChallenge });
    return { codeVerifier, codeChallenge };
  }

  // Generate random state for CSRF protection
  private generateState(): string {
    return this.generateRandomString(32);
  }

  // Start the PKCE authentication flow
  async signinRedirect(): Promise<void> {
    try {
      console.log('=== SIGNIN REDIRECT CALLED ===');
      // Always check for both code_verifier and state
      let codeVerifier = sessionStorage.getItem('pkce_code_verifier');
      let state = sessionStorage.getItem('pkce_state');
      let codeChallenge: string | null = null;
      if (codeVerifier && state) {
        // Compute code_challenge from codeVerifier
        const encoder = new TextEncoder();
        const data = encoder.encode(codeVerifier);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const base64 = btoa(String.fromCharCode.apply(null, hashArray));
        codeChallenge = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      }
      // If any value is missing, generate a new PKCE pair and state
      if (!codeVerifier || !state || !codeChallenge) {
        console.log('Generating new PKCE pair and state (missing or invalid in sessionStorage)');
        const pkce = await this.generatePKCE();
        codeVerifier = pkce.codeVerifier;
        codeChallenge = pkce.codeChallenge;
        state = this.generateState();
        sessionStorage.setItem('pkce_code_verifier', codeVerifier);
        sessionStorage.setItem('pkce_state', state);
      }
      this.codeVerifier = codeVerifier;
      // Build the authorization URL
      const params = new URLSearchParams({
        client_id: 'react-app',
        redirect_uri: 'http://localhost:3000/callback',
        response_type: 'code',
        scope: 'openid profile email',
        state: state!,
        code_challenge: codeChallenge!,
        code_challenge_method: 'S256'
      });
      const authUrl = `http://localhost:8090/api/v1/auth/pkce/authorize?${params.toString()}`;
      console.log('Redirecting to:', authUrl);
      window.location.href = authUrl;
    } catch (error) {
      console.error('Signin redirect error:', error);
      throw error;
    }
  }

  // Handle the callback from the authorization server
  async signinRedirectCallback(): Promise<AuthUser> {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');

      console.log('Callback received:', { code, state, error });

      if (error) {
        throw new Error(`Authorization error: ${error}`);
      }

      if (!code) {
        throw new Error('No authorization code received');
      }

      // Verify state
      const storedState = sessionStorage.getItem('pkce_state');
      console.log('State verification:', { received: state, stored: storedState });
      if (state !== storedState) {
        throw new Error('Invalid state parameter');
      }

      // Get stored code verifier
      const codeVerifier = sessionStorage.getItem('pkce_code_verifier');
      console.log('Code verifier from sessionStorage:', codeVerifier);
      if (!codeVerifier) {
        throw new Error('No code verifier found');
      }

      // Exchange code for token
      const tokenResponse = await this.exchangeCodeForToken(code, codeVerifier);
      
      // Store user
      this.user = tokenResponse;
      localStorage.setItem('auth_user', JSON.stringify(tokenResponse));

      // Clean up session storage
      sessionStorage.removeItem('pkce_code_verifier');
      sessionStorage.removeItem('pkce_state');

      return tokenResponse;
    } catch (error) {
      console.error('Signin callback error:', error);
      throw error;
    }
  }

  // Exchange authorization code for access token
  private async exchangeCodeForToken(code: string, codeVerifier: string): Promise<AuthUser> {
    const requestBody = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: 'react-app',
      code: code,
      redirect_uri: 'http://localhost:3000/callback',
      code_verifier: codeVerifier
    });

    console.log('Token exchange request:', {
      code,
      code_verifier: codeVerifier,
      redirect_uri: 'http://localhost:3000/callback'
    });

    const response = await fetch('http://localhost:8090/api/v1/auth/pkce/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: requestBody
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Token exchange error response:', errorData);
      throw new Error(errorData.error || 'Token exchange failed');
    }

    const tokenResponse = await response.json();
    console.log('Token exchange successful:', tokenResponse);
    return tokenResponse;
  }

  // Get current user
  getUser(): AuthUser | null {
    return this.user;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.user !== null && this.user.access_token !== null;
  }

  // Get access token
  getAccessToken(): string | null {
    return this.user?.access_token || null;
  }

  // Sign out
  async signoutRedirect(): Promise<void> {
    this.user = null;
    localStorage.removeItem('auth_user');
    sessionStorage.removeItem('pkce_code_verifier');
    sessionStorage.removeItem('pkce_state');
    
    // Redirect to logout endpoint
    window.location.href = 'http://localhost:8090/logout';
  }

  // Remove user data
  removeUser(): void {
    this.user = null;
    localStorage.removeItem('auth_user');
    sessionStorage.removeItem('pkce_code_verifier');
    sessionStorage.removeItem('pkce_state');
  }
}

export const customAuthService = new CustomAuthService();
export default customAuthService; 