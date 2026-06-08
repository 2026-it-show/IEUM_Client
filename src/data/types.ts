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

export type ExperienceCategoryId =
  | 'ai'
  | 'human'
  | 'network'
  | 'personal'
  | 'creative'
  | 'global'
  | 'journey';

export interface ExperienceCategory {
  id: ExperienceCategoryId;
  title: string;
  color: string;
  /** 0~1 normalized position on the map image */
  x: number;
  y: number;
}

export interface ProjectListItem {
  id: string;
  name: string;
  thumbnail: string;
  group: 'SW' | 'DE';
}
