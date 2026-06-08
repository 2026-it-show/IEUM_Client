import styled from 'styled-components';

type ColorVariant = 'light' | 'dark';

interface VariantProps {
  $color: ColorVariant;
}

const resolveColor = (
  variant: ColorVariant,
  light: string,
  dark: string,
): string => (variant === 'light' ? light : dark);

export const Header = styled.header`
  display: flex;
  align-items: center;
  padding: 65px ${({ theme }) => theme.layout.pagePadding} 0;
  flex-shrink: 0;
`;

export const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0;
`;

export const Icon = styled.span<VariantProps>`
  display: inline-block;
  width: 17px;
  height: 34px;
  flex-shrink: 0;
  background-color: ${({ theme, $color }) =>
    resolveColor($color, theme.colors.textLight, theme.colors.black)};
  -webkit-mask: url('/assets/icons/back_icon.svg') no-repeat center / contain;
  mask: url('/assets/icons/back_icon.svg') no-repeat center / contain;
`;

export const Title = styled.span<VariantProps>`
  font-size: 16px;
  line-height: 1;
  color: ${({ theme, $color }) =>
    resolveColor($color, theme.colors.textLight, theme.colors.black)};
`;
