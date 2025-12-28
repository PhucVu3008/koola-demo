import api from '@/lib/axios';
import { User } from '@/types';
import { normalizeUsername } from '@/lib/validation';

export interface UserListParams {
  page?: number;
  search?: string;
  role?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface UserListResponse {
  users: User[];
  totalPages: number;
  currentPage: number;
  totalUsers: number;
}

export interface CreateUserPayload {
  username: string;
  password: string;
  email: string;
  role: 'lv1' | 'lv2' | 'lv3';
  phone?: string;
  address?: string;
  dateOfBirth?: string;
}

export interface UpdateUserPayload {
  username?: string;
  password?: string;
  email?: string;
  role?: 'lv1' | 'lv2' | 'lv3';
  phone?: string;
  address?: string;
  dateOfBirth?: string;
}

export const getUsers = async (params: UserListParams) => {
  const response = await api.get<UserListResponse>('/users', { params });
  return response.data;
};

export const getUserById = async (id: string) => {
  const response = await api.get<User>(`/users/${id}`);
  return response.data;
};

export const createUser = async (payload: CreateUserPayload) => {
  const response = await api.post<User>('/users', {
    ...payload,
    username: normalizeUsername(payload.username)
  });
  return response.data;
};

export const updateUser = async (id: string, payload: UpdateUserPayload) => {
  const normalizedPayload = {
    ...payload,
    ...(payload.username !== undefined
      ? { username: normalizeUsername(payload.username) }
      : {})
  };
  const response = await api.patch<User>(`/users/${id}`, normalizedPayload);
  return response.data;
};

export const deleteUser = async (id: string) => {
  await api.delete(`/users/${id}`);
};
