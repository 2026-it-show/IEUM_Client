import styled from 'styled-components';

export const Wrapper = styled.section`
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

export const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-bottom: calc(
    ${({ theme }) => theme.layout.bottomCTAOffset} + 56px + 32px
  );
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const Banner = styled.div`
  margin-top: 16px;
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f6a06e;
  color: ${({ theme }) => theme.colors.white};
  font-size: 18px;
  letter-spacing: 1px;
`;

export const Card = styled.div`
  margin: 24px ${({ theme }) => theme.layout.pagePadding} 0;
  border-radius: ${({ theme }) => theme.radius.lg};
  overflow: hidden;

  img {
    width: 100%;
    height: auto;
    display: block;
  }
`;

export const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px ${({ theme }) => theme.layout.pagePadding} 0;
`;

export const ServiceName = styled.h2`
  font-size: 26px;
  line-height: 1.2;
  color: ${({ theme }) => theme.colors.black};
`;

export const LikeButton = styled.button`
  width: 36px;
  height: 36px;
  padding: 0;
  background: none;
  border: none;

  img {
    width: 100%;
    height: 100%;
  }
`;

export const Description = styled.p`
  padding: 10px ${({ theme }) => theme.layout.pagePadding} 0;
  font-size: 14px;
  line-height: 1.5;
  color: #4b4b4b;
  white-space: pre-line;
`;

export const TagList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 18px ${({ theme }) => theme.layout.pagePadding} 0;
`;

interface TagProps {
  $bg: string;
  $color: string;
}

export const Tag = styled.li<TagProps>`
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  background-color: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
`;

export const BottomCTA = styled.div`
  position: absolute;
  left: ${({ theme }) => theme.layout.pagePadding};
  right: ${({ theme }) => theme.layout.pagePadding};
  bottom: ${({ theme }) => theme.layout.bottomCTAOffset};
  display: flex;
  gap: 10px;
  z-index: 5;
`;

export const FeedbackButton = styled.button`
  flex: 1;
  height: 56px;
  border-radius: ${({ theme }) => theme.radius.md};
  background-color: #4e3e85;
  color: ${({ theme }) => theme.colors.white};
  font-size: 20px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: filter 0.15s ease;

  &:active {
    filter: brightness(0.95);
  }
`;

export const HireButton = styled.button`
  flex: 1;
  height: 56px;
  border-radius: ${({ theme }) => theme.radius.md};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  font-size: 20px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: filter 0.15s ease;

  &:active {
    filter: brightness(0.95);
  }
`;
