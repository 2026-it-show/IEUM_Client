const colors = {
  primary: '#EC5665',
  white: '#FFFFFF',
  black: '#000000',
  textLight: '#EEEEEE',

  gray100: '#F5F5F5',
  gray200: '#E5E7EB',
  gray300: '#C4C4C4',
  gray400: '#9CA3AF',
  gray500: '#6B7280',

  bgPlaceholder: '#D9D9D9',
} as const;

const fonts = {
  medium: "'GmarketSansMedium', sans-serif",
} as const;

const viewport = {
  width: '390px',
  height: '844px',
} as const;

const layout = {
  pagePadding: '24px',
  bottomCTAOffset: '37px',
} as const;

const radius = {
  sm: '8px',
  md: '12px',
  lg: '20px',
} as const;

export const theme = {
  colors,
  fonts,
  viewport,
  layout,
  radius,
} as const;

export type AppTheme = typeof theme;
