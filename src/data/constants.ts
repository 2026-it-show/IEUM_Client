export const APP_NAME = 'IEUM';

export const API_BASE_URL =
  (import.meta.env.VITE_IEUM_API_BASE_URL as string | undefined) ??
  '/api';

export const SOCKET_URL =
  (import.meta.env.VITE_SOCKET_URL as string | undefined) ??
  'wss://api-ieum.mmhs.app/ws';

export const ROUTES = {
  HOME: '/',
  NOT_FOUND: '*',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
