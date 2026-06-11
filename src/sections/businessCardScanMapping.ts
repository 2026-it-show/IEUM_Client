import type { IeumVisitorProfile } from '@/api/ieumApi';
import type { BusinessCard } from '@/data';

export const EMPTY_BUSINESS_CARD: BusinessCard = {
  companyName: '',
  companyAddress: '',
  name: '',
  position: '',
  phone: '',
  email: '',
};

export function businessCardFromProfile(
  profile: IeumVisitorProfile,
): BusinessCard {
  return {
    companyName: profile.ocrOrganization ?? '',
    companyAddress: inferAddress(profile.ocrRawText ?? ''),
    name: profile.ocrName ?? '',
    position: profile.ocrPosition ?? '',
    phone: profile.ocrPhone ?? '',
    email: profile.ocrEmail ?? '',
  };
}

function inferAddress(rawText: string): string {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.find(isAddressLine) ?? '';
}

function isAddressLine(line: string): boolean {
  if (/@/.test(line) || /\d{2,4}[-\s)]\d{3,4}[-\s]\d{4}/.test(line)) {
    return false;
  }
  return /(서울|경기|인천|부산|대구|광주|대전|울산|세종|제주|도|시|군|구|로|길)/.test(
    line,
  );
}
