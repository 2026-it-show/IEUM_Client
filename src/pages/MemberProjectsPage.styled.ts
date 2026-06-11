import styled, { keyframes } from 'styled-components';

export const Page = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background-color: ${({ theme }) => theme.colors.white};
`;

export const Grid = styled.div`
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 28px 16px;
  align-content: start;
  padding: 24px ${({ theme }) => theme.layout.pagePadding} 40px;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const ProjectCard = styled.button`
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: left;
  cursor: pointer;
`;

export const Thumbnail = styled.img`
  width: 100%;
  aspect-ratio: 163 / 117;
  border-radius: 12px;
  object-fit: cover;
  background-color: ${({ theme }) => theme.colors.bgPlaceholder};
`;

export const ProjectLabel = styled.span`
  padding: 0 12px;
  font-size: 16px;
  line-height: 1;
  color: #222222;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const StatusText = styled.p`
  padding: 48px ${({ theme }) => theme.layout.pagePadding};
  font-size: 15px;
  line-height: 1.5;
  color: #777777;
  text-align: center;
`;

const shimmer = keyframes`
  0% { opacity: 0.55; }
  50% { opacity: 1; }
  100% { opacity: 0.55; }
`;

export const SkeletonCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  animation: ${shimmer} 1.4s ease-in-out infinite;
`;

export const SkeletonThumbnail = styled.div`
  width: 100%;
  aspect-ratio: 163 / 117;
  border-radius: 12px;
  background-color: #ececec;
`;

export const SkeletonLabel = styled.div`
  width: 70%;
  height: 16px;
  margin: 0 12px;
  border-radius: 6px;
  background-color: #ececec;
`;
