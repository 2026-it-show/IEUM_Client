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

export const Header = styled.header<{ $compact: boolean }>`
  display: flex;
  align-items: center;
  min-height: ${({ $compact }) => ($compact ? '80px' : '62px')};
  padding: 0 ${({ theme }) => theme.layout.pagePadding};
  flex-shrink: 0;
`;

export const AppBar = styled.div`
  position: sticky;
  top: 0;
  z-index: 5;
  flex-shrink: 0;
  background-color: ${({ theme }) => theme.colors.white};
`;

export const BackButton = styled.button<VariantProps>`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0;
  color: ${({ theme, $color }) =>
    resolveColor($color, theme.colors.white, theme.colors.black)};
`;

export const BackIcon = styled.img`
  width: 17px;
  height: 34px;
  filter: none;
`;

export const Title = styled.span`
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
  color: inherit;
`;

export const Band = styled.div<{ $background: string }>`
  width: 100%;
  height: 37px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ $background }) => $background};
  color: ${({ theme }) => theme.colors.black};
  font-size: 22px;
  line-height: 1;
  letter-spacing: 0;
`;
