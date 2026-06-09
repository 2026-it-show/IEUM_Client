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

const savedBusinessCardSchema = z.object({
  card: businessCardSchema,
  visitorProfileId: z.string().nullable().optional(),
});

export interface SavedBusinessCard {
  readonly card: BusinessCard;
  readonly visitorProfileId: string | null;
}

export function saveBusinessCard(
  card: BusinessCard,
  visitorProfileId: string | null = null,
): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ card, visitorProfileId }),
  );
}

export function loadBusinessCard(): BusinessCard | null {
  return loadSavedBusinessCard()?.card ?? null;
}

export function loadSavedBusinessCard(): SavedBusinessCard | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    const saved = savedBusinessCardSchema.safeParse(parsed);
    if (saved.success) {
      return {
        card: saved.data.card,
        visitorProfileId: saved.data.visitorProfileId ?? null,
      };
    }
    return {
      card: businessCardSchema.parse(parsed),
      visitorProfileId: null,
    };
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}
