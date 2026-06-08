import { z } from 'zod';
import type { BusinessCard } from '@/data';

const STORAGE_KEY = 'ieum.businessCard';

const businessCardSchema = z.object({
  companyName: z.string(),
  companyAddress: z.string(),
  name: z.string(),
  position: z.string(),
  phone: z.string(),
  email: z.string(),
});

export function saveBusinessCard(card: BusinessCard): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(card));
}

export function loadBusinessCard(): BusinessCard | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return businessCardSchema.parse(parsed);
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}
