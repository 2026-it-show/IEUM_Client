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
  padding: 60px ${({ theme }) => theme.layout.pagePadding} 0;
  flex-shrink: 0;
`;

export const BackButton = styled.button<VariantProps>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0;
  color: ${({ theme, $color }) =>
    resolveColor($color, theme.colors.white, theme.colors.black)};
`;

export const Title = styled.span`
  font-size: 16px;
  line-height: 1;
  color: inherit;
`;
