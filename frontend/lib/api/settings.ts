import api from '@/lib/axios';
import { Setting } from '@/types';

export const getSettings = async () => {
  const response = await api.get<Setting[]>('/settings');
  return response.data;
};

export const updateSetting = async (key: string, value: string) => {
  const response = await api.patch<Setting>(`/settings/${key}`, { value });
  return response.data;
};

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const changePassword = async (payload: ChangePasswordPayload) => {
  const response = await api.patch<{ message: string }>(
    '/users/me/password',
    payload
  );
  return response.data;
};
