import styled from 'styled-components';

export const Overlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 4;
  background-color: rgba(0, 0, 0, 0.55);
  cursor: pointer;
`;

export const Anchor = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(${({ theme }) => theme.layout.bottomCTAOffset} + 56px + 8px);
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
`;

export const Caption = styled.p`
  color: ${({ theme }) => theme.colors.white};
  font-size: 14px;
  line-height: 1.5;
  text-align: center;
  margin-bottom: 12px;
  white-space: pre-line;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.45);
`;

export const Arrow = styled.svg`
  width: 70px;
  height: 60px;
  margin-left: 12px;
`;
