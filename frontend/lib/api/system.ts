import api from '@/lib/axios';

export const getSystemInfo = async () => {
  const response = await api.get('/system');
  return response.data;
};
