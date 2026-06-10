import styled from 'styled-components';

export const Overlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 8;
  background-color: rgba(0, 0, 0, 0.72);
  cursor: pointer;
`;

export const Anchor = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: 663px;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
`;

export const Caption = styled.p`
  color: ${({ theme }) => theme.colors.white};
  font-size: 12px;
  font-weight: 500;
  line-height: 1.5;
  text-align: center;
  margin: 0;
  white-space: pre-line;
`;

export const Arrow = styled.img`
  width: 35px;
  height: 36px;
  margin-top: 18px;
  margin-left: 8px;
  transform: rotate(180deg);
`;

export const ActionRow = styled.div<{ $single: boolean }>`
  position: absolute;
  left: 23px;
  right: 24px;
  bottom: 25px;
  display: flex;
  gap: 9px;
  pointer-events: none;

  > * {
    flex: ${({ $single }) => ($single ? '0 0 167px' : '1 1 0')};
    margin-left: ${({ $single }) => ($single ? 'auto' : 0)};
  }
`;

const TutorialButton = styled.div`
  height: 60px;
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 500;
  line-height: 1.5;
`;

export const FeedbackButton = styled(TutorialButton)`
  background-color: #4e3e85;
`;

export const HireButton = styled(TutorialButton)`
  background-color: ${({ theme }) => theme.colors.primary};
`;
