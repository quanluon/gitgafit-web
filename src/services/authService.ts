import { apiClient } from './api';
import { ApiResponse } from '@/types/common';
import { User } from '@/types/user';

interface RegisterRequest {
  email: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

class AuthServiceClass {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data.data!;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return response.data.data!;
  }
}

export const authService = new AuthServiceClass();

