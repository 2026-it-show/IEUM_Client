import styled from 'styled-components';

export const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

export const Label = styled.span`
  font-size: 14px;
  line-height: 1.2;
  color: ${({ theme }) => theme.colors.black};
`;

export const Input = styled.input`
  width: 100%;
  min-height: 58px;
  padding: 15px 16px 13px;
  border: 1px solid ${({ theme }) => theme.colors.gray200};
  border-radius: ${({ theme }) => theme.radius.md};
  background-color: ${({ theme }) => theme.colors.white};
  font-size: 15px;
  line-height: 1.4;
  color: ${({ theme }) => theme.colors.black};
  outline: none;
  transition: border-color 0.15s ease;
  appearance: none;

  &::placeholder {
    color: ${({ theme }) => theme.colors.gray400};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;
