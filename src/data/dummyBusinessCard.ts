import type { BusinessCard, BusinessCardField } from './types';

export const DUMMY_BUSINESS_CARD: BusinessCard = {
  companyName: '신영증권',
  companyAddress: '서울특별시 영등포구 국제금융로8길 16',
  name: '정지영',
  position: '헤리티지 솔루션부 팀장',
  phone: '010-9082-7378',
  email: 'jeong.jiyoung@shinyoung.com',
};

export const BUSINESS_CARD_FIELDS: Array<{
  key: BusinessCardField;
  label: string;
}> = [
  { key: 'companyName', label: '회사명' },
  { key: 'companyAddress', label: '회사 위치' },
  { key: 'name', label: '성함' },
  { key: 'position', label: '직책' },
  { key: 'phone', label: '전화번호' },
  { key: 'email', label: '이메일' },
];
