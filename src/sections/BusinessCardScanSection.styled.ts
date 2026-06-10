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
