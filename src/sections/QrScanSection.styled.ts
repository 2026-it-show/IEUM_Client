import styled from 'styled-components';

export const Wrapper = styled.section`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 28px ${({ theme }) => theme.layout.pagePadding} 36px;
  background-color: ${({ theme }) => theme.colors.bgPlaceholder};
  min-height: 0;
  user-select: none;
  touch-action: manipulation;
`;

export const CameraArea = styled.div`
  position: relative;
  width: min(277px, 78vw);
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radius.lg};
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
  border-radius: ${({ theme }) => theme.radius.lg};
  pointer-events: none;
`;

export const Hint = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.white};
  font-size: 14px;
  line-height: 1.4;
  text-align: center;
`;

export const ErrorText = styled.p`
  max-width: 300px;
  margin: 0;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 13px;
  line-height: 1.4;
  text-align: center;
`;

export const PhotoPicker = styled.label`
  position: relative;
  width: min(277px, 78vw);
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
