import { apiClient } from './api';
import { ApiResponse } from '@/types/common';
import { User, UserProfile } from '@/types/user';

class UserServiceClass {
  async getProfile(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/user/profile');
    return response.data.data!;
  }

  async updateProfile(data: Partial<UserProfile>): Promise<User> {
    const response = await apiClient.patch<ApiResponse<User>>('/user/profile', data);
    return response.data.data!;
  }

  async isProfileComplete(): Promise<boolean> {
    const response = await apiClient.get<ApiResponse<{ isComplete: boolean }>>(
      '/user/profile/complete',
    );
    return response.data.data!.isComplete;
  }
}

export const userService = new UserServiceClass();

