import styled from 'styled-components';

export const Overlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 8;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.2) 0%,
    rgba(0, 0, 0, 0.08) 28%,
    rgba(0, 0, 0, 0.1) 66%,
    rgba(0, 0, 0, 0.22) 100%
  );
  color: ${({ theme }) => theme.colors.white};
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
`;

export const TopHint = styled.div`
  position: absolute;
  top: 104px;
  left: 24px;
  right: 24px;
  display: flex;
  justify-content: center;
  pointer-events: none;
`;

export const QrHint = styled.div`
  position: absolute;
  right: 16px;
  bottom: 88px;
  width: 210px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  pointer-events: none;
`;

export const HintText = styled.p`
  max-width: 250px;
  margin: 0;
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(34, 34, 34, 0.72);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  font-size: 13px;
  font-weight: 500;
  line-height: 1.45;
  text-align: center;
  word-break: keep-all;
`;

export const Arrow = styled.svg`
  width: 68px;
  height: 58px;
  margin-right: 22px;
`;

export const DismissChip = styled.span`
  position: absolute;
  left: 50%;
  bottom: 28px;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 132px;
  height: 40px;
  padding: 0 18px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.primary};
  box-shadow: 0 8px 24px rgba(236, 86, 101, 0.28);
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
  pointer-events: none;
`;
