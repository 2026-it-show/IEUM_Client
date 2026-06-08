export const APP_NAME = 'IEUM';

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'http://localhost:8080';

export const SOCKET_URL =
  (import.meta.env.VITE_SOCKET_URL as string | undefined) ??
  'ws://localhost:8080/ws';

export const ROUTES = {
  HOME: '/',
  NOT_FOUND: '*',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
