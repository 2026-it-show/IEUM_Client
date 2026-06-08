import styled from 'styled-components';

export const Wrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background-color: ${({ theme }) => theme.colors.bgPlaceholder};
  cursor: pointer;
  user-select: none;
`;

export const Frame = styled.div`
  width: 343px;
  height: 206px;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radius.lg};
  background-color: ${({ theme }) => theme.colors.white};
`;

export const Hint = styled.p`
  font-size: 14px;
  line-height: 1.4;
  color: ${({ theme }) => theme.colors.textLight};
  text-align: center;
`;
