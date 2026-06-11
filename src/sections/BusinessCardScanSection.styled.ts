import styled from 'styled-components';

export const Wrapper = styled.section`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 18px;
  padding: clamp(156px, 24dvh, 214px) ${({ theme }) => theme.layout.pagePadding}
    36px;
  background-color: ${({ theme }) => theme.colors.bgPlaceholder};
  min-height: 0;
  user-select: none;
  touch-action: manipulation;
`;

export const CameraArea = styled.div`
  position: relative;
  width: min(343px, 100%);
  aspect-ratio: 343 / 244;
  min-height: min(244px, 32dvh);
  overflow: hidden;
  border-radius: 24px;
  background-color: ${({ theme }) => theme.colors.white};
`;

export const Video = styled.video`
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
`;

export const Frame = styled.div`
  position: absolute;
  inset: 0;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: 24px;
  pointer-events: none;
`;

export const DetectionPolygon = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  filter: drop-shadow(0 0 9px rgba(232, 73, 91, 0.44));
`;

export const DetectionShape = styled.polygon`
  fill: rgba(232, 73, 91, 0.08);
  stroke: ${({ theme }) => theme.colors.primary};
  stroke-width: 3;
  stroke-linejoin: round;
`;

export const DetectionCorner = styled.circle`
  fill: ${({ theme }) => theme.colors.primary};
  stroke: ${({ theme }) => theme.colors.white};
  stroke-width: 2;
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
  margin: -6px 0 0;
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
  position: absolute;
  left: 50%;
  bottom: 12px;
  transform: translateX(-50%);
  width: 54px;
  height: 54px;
  border-radius: 50%;
  border: 4px solid rgba(255, 255, 255, 0.95);
  background: rgba(255, 255, 255, 0.35);
  cursor: pointer;
  transition: background 0.15s ease;

  &:active {
    background: rgba(255, 255, 255, 0.65);
  }

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
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
