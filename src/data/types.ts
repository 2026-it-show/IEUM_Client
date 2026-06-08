export interface User {
  id: string;
  nickname: string;
  avatarUrl?: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  code: number;
}

export interface BusinessCard {
  companyName: string;
  companyAddress: string;
  name: string;
  position: string;
  phone: string;
  email: string;
}

export type BusinessCardField = keyof BusinessCard;
