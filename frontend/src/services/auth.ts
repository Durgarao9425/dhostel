import api from './api';

export interface LoginCredentials {
  identifier: string; // email or mobile
  password: string;
}

export interface User {
  user_id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  role_id?: number;
  phone?: string;
  hostel_id?: number; // Added for single hostel per user model
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    if (response.data.success) {
      // Use sessionStorage for tab-independent sessions
      sessionStorage.setItem('authToken', response.data.data.token);
      sessionStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('user');
    }
  },

  async forgotPassword(identifier: string, method: 'otp' | 'email'): Promise<any> {
    const response = await api.post('/auth/forgot-password', { identifier, method });
    return response.data;
  },

  async verifyOTP(resetToken: string, otp: string, newPassword: string): Promise<any> {
    const response = await api.post('/auth/verify-otp', { resetToken, otp, newPassword });
    return response.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<any> {
    const response = await api.post('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<{ success: boolean; data: User }>('/auth/me');
    return response.data.data;
  },

  getStoredUser(): User | null {
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated(): boolean {
    return !!sessionStorage.getItem('authToken');
  },
};
