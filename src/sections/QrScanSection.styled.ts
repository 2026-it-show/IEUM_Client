import styled from 'styled-components';

export const Wrapper = styled.section`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 29px;
  padding: min(23.4dvh, 199px) ${({ theme }) => theme.layout.pagePadding} 36px;
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
  line-height: 20px;
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
