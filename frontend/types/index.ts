export interface User {
  _id: string;
  username: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  role: 'lv1' | 'lv2' | 'lv3';
}

export interface LoginResponse {
  _id: string;
  username: string;
  email: string;
  role: string;
  token: string;
}

export interface Setting {
  _id: string;
  key: string;
  value: string;
  description: string;
}
