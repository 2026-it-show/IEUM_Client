import styled from 'styled-components';

export const Wrapper = styled.section`
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding-bottom: calc(
    ${({ theme }) => theme.layout.bottomCTAOffset} + 56px + 28px
  );
  background-color: ${({ theme }) => theme.colors.bgPlaceholder};
  user-select: none;
  touch-action: manipulation;
`;

export const Content = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 14px;
  padding: clamp(92px, 15dvh, 156px) ${({ theme }) => theme.layout.pagePadding}
    0;

  @media (max-height: 760px) {
    padding-top: clamp(72px, 11dvh, 104px);
  }
`;

export const CameraArea = styled.div`
  position: relative;
  width: min(343px, 100%);
  aspect-ratio: 343 / 244;
  min-height: min(244px, 32dvh);
  overflow: hidden;
  border-radius: 24px;
  background-color: ${({ theme }) => theme.colors.black};
`;

export const Video = styled.video`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
`;

export const StepNotice = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  width: min(260px, calc(100% - 48px));
  padding: 18px 20px 16px;
  border-radius: 18px;
  background-color: rgba(255, 255, 255, 0.94);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.18);
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  text-align: center;
  pointer-events: none;
`;

export const StepNoticeTitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 18px;
  line-height: 1.25;
`;

export const StepNoticeText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.black};
  font-size: 14px;
  line-height: 1.4;
`;

export const Hint = styled.p`
  max-width: 320px;
  margin: 0;
  color: ${({ theme }) => theme.colors.white};
  font-size: 14px;
  line-height: 20px;
  text-align: center;
  white-space: pre-line;
`;

export const StatusText = styled.p<{ $active: boolean }>`
  min-height: 20px;
  margin: -4px 0 2px;
  color: ${({ theme, $active }) =>
    $active ? theme.colors.white : theme.colors.textLight};
  font-size: 13px;
  line-height: 20px;
  text-align: center;
  opacity: ${({ $active }) => ($active ? 1 : 0.72)};
`;

export const ErrorText = styled.p`
  max-width: 320px;
  margin: 0;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 13px;
  line-height: 1.4;
  text-align: center;
`;

export const ShutterButton = styled.button`
  width: 100%;
  height: 56px;
  padding: 0 18px;
  border-radius: ${({ theme }) => theme.radius.md};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
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

export const BottomAction = styled.div`
  position: absolute;
  left: ${({ theme }) => theme.layout.pagePadding};
  right: ${({ theme }) => theme.layout.pagePadding};
  bottom: ${({ theme }) => theme.layout.bottomCTAOffset};
`;

export const HiddenCanvas = styled.canvas`
  position: fixed;
  width: 0;
  height: 0;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
  display: none !important;
`;
