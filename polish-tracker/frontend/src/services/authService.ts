import axios from 'axios';
import { User, ApiResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

class AuthService {
  private api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Set auth token for requests
  setAuthToken(token: string | null) {
    if (token) {
      this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.api.defaults.headers.common['Authorization'];
    }
  }

  // Get current user info
  async getCurrentUser(token: string): Promise<User> {
    this.setAuthToken(token);
    const response = await this.api.get<ApiResponse<User>>('/auth/me');
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to get user info');
    }
    
    return response.data.data;
  }

  // Dev mode login
  async devLogin(): Promise<{ token: string; user: User }> {
    const response = await this.api.post<ApiResponse<{ token: string; user: User }>>('/auth/dev-login');
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Dev login failed');
    }
    
    return response.data.data;
  }

  // OAuth login URLs
  getGoogleLoginUrl(): string {
    return `${API_BASE_URL}/api/auth/google`;
  }

  getGitHubLoginUrl(): string {
    return `${API_BASE_URL}/api/auth/github`;
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await this.api.post('/auth/logout');
    } catch (error) {
      // Ignore logout errors
      console.warn('Logout request failed:', error);
    } finally {
      this.setAuthToken(null);
    }
  }

  // Check if dev mode is enabled
  isDevMode(): boolean {
    return process.env.REACT_APP_DEV_MODE === 'true';
  }
}

export const authService = new AuthService();