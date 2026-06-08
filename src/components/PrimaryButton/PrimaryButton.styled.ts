import styled from 'styled-components';

export const Button = styled.button`
  width: 100%;
  height: 56px;
  border-radius: ${({ theme }) => theme.radius.md};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  font-size: 20px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: filter 0.15s ease;

  &:active {
    filter: brightness(0.95);
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.gray300};
    cursor: not-allowed;
  }
`;
