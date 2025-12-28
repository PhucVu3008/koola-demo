import api from '@/lib/axios';
import { LoginResponse } from '@/types';
import { normalizeUsername } from '@/lib/validation';

export interface LoginPayload {
  username: string;
  password: string;
}

export const createSession = async (payload: LoginPayload) => {
  const response = await api.post<LoginResponse>('/sessions', {
    ...payload,
    username: normalizeUsername(payload.username)
  });
  return response.data;
};
