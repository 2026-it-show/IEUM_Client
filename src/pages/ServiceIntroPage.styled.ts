import styled, { css, keyframes } from 'styled-components';

const skeletonPulse = keyframes`
  0% {
    background-position: 120% 0;
  }

  100% {
    background-position: -120% 0;
  }
`;

const skeletonSurface = css`
  background: linear-gradient(
    90deg,
    #f2f2f2 0%,
    #fafafa 42%,
    #ececec 78%
  );
  background-size: 220% 100%;
  animation: ${skeletonPulse} 1.1s ease-in-out infinite;
`;

export const Page = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.white};
  overflow: hidden;
`;

export const StatusText = styled.p`
  padding: 32px ${({ theme }) => theme.layout.pagePadding};
  font-size: 15px;
  line-height: 1.5;
  color: #777777;
`;

export const SkeletonScroll = styled.div`
  flex: 1;
  overflow-y: hidden;
  padding-bottom: 40px;
`;

export const SkeletonHero = styled.div`
  margin: 27px 20px 0;
  border-radius: 14px;
  aspect-ratio: 342 / 246;
  ${skeletonSurface}
`;

export const SkeletonTitleRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  padding: 24px 20px 0;
`;

export const SkeletonTitleBlock = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const SkeletonTitle = styled.div`
  width: 42%;
  height: 31px;
  border-radius: 8px;
  ${skeletonSurface}
`;

export const SkeletonTextLine = styled.div<{ $width: string }>`
  width: ${({ $width }) => $width};
  height: 18px;
  border-radius: 6px;
  ${skeletonSurface}
`;

export const SkeletonHeart = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 999px;
  ${skeletonSurface}
`;

export const SkeletonTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px 9px;
  padding: 18px 20px 0;
`;

export const SkeletonTag = styled.div<{ $width: string }>`
  width: ${({ $width }) => $width};
  height: 24px;
  border-radius: 35px;
  ${skeletonSurface}
`;

export const SkeletonDetailList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 28px 20px 24px;
`;

export const SkeletonDetailBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 9px;
`;

export const SkeletonSectionTitle = styled.div`
  width: 82px;
  height: 17px;
  border-radius: 6px;
  ${skeletonSurface}
`;
