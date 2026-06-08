import styled, { keyframes } from 'styled-components';

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, -8px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
`;

export const Container = styled.div`
  position: absolute;
  top: 64px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  max-width: calc(100% - 32px);
  padding: 12px 22px;
  border-radius: 999px;
  background-color: ${({ theme }) => theme.colors.white};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  color: ${({ theme }) => theme.colors.black};
  font-size: 14px;
  line-height: 1.3;
  text-align: center;
  white-space: nowrap;
  animation: ${slideIn} 0.2s ease-out;
  pointer-events: none;
`;
