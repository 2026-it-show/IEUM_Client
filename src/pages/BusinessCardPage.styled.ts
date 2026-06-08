import styled from 'styled-components';

type PageVariant = 'scan' | 'form';

export const Page = styled.div<{ $variant: PageVariant }>`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: ${({ theme, $variant }) =>
    $variant === 'scan' ? theme.colors.bgPlaceholder : theme.colors.white};
`;
