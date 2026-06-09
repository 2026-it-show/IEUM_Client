import styled from 'styled-components';

export const Wrapper = styled.section`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  padding: 28px ${({ theme }) => theme.layout.pagePadding} 36px;
  background-color: ${({ theme }) => theme.colors.bgPlaceholder};
  min-height: 0;
  user-select: none;
  touch-action: manipulation;
`;

export const CameraArea = styled.div`
  position: relative;
  width: min(343px, 100%);
  aspect-ratio: 343 / 206;
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
  line-height: 1.45;
  text-align: center;
  white-space: pre-line;
`;

export const ErrorText = styled.p`
  max-width: 320px;
  margin: 0;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 13px;
  line-height: 1.4;
  text-align: center;
`;

export const Actions = styled.div`
  display: flex;
  gap: 10px;
  width: min(343px, 100%);
`;

export const CaptureButton = styled.button`
  flex: 1;
  height: 50px;
  border: 0;
  border-radius: 999px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: progress;
  }
`;

export const PhotoPicker = styled.label`
  position: relative;
  flex: 1;
  height: 50px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.black};
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;

  input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }
`;
