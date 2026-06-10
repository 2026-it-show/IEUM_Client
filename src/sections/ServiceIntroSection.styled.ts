import styled from 'styled-components';

export const Wrapper = styled.section`
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

export const ScrollArea = styled.div<{ $hasCta: boolean }>`
  flex: 1;
  overflow-y: auto;
  padding-bottom: calc(
    ${({ theme, $hasCta }) =>
      $hasCta ? `${theme.layout.bottomCTAOffset} + 56px + 32px` : '40px'}
  );
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const Card = styled.div`
  margin: 27px 20px 0;
  border-radius: 14px;
  overflow: hidden;

  img {
    width: 100%;
    aspect-ratio: 342 / 246;
    height: auto;
    display: block;
    object-fit: cover;
  }
`;

export const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 24px 20px 0;
`;

export const TitleText = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const BoothCode = styled.span`
  align-self: flex-start;
  min-height: 22px;
  padding: 0 10px;
  border-radius: 999px;
  background-color: #fbdde3;
  color: ${({ theme }) => theme.colors.primary};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  line-height: 1;
  letter-spacing: 0;
`;

export const ServiceName = styled.h2`
  font-size: 26px;
  line-height: 1.2;
  color: ${({ theme }) => theme.colors.black};
  word-break: keep-all;
`;

export const LikeButton = styled.button<{ $active: boolean }>`
  flex: 0 0 auto;
  width: 36px;
  height: 36px;
  padding: 0;
  background: none;
  border: none;
  color: ${({ theme, $active }) => ($active ? theme.colors.primary : '#b9b9b9')};
  transition: transform 0.14s ease;

  &:active {
    transform: scale(0.92);
  }
`;

export const HeartIcon = styled.svg`
  width: 100%;
  height: 100%;
  display: block;

  path {
    fill: ${({ theme }) => theme.colors.white};
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: fill 0.14s ease, stroke 0.14s ease;
  }

  ${LikeButton}[aria-pressed='true'] & path {
    fill: currentColor;
  }
`;

export const Description = styled.p`
  padding: 10px 20px 0;
  font-size: 14px;
  line-height: 1.5;
  color: #4b4b4b;
  white-space: pre-line;
`;

export const TagList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 10px 9px;
  padding: 18px 20px 0;
`;

interface TagProps {
  $bg: string;
  $color: string;
}

export const Tag = styled.li<TagProps>`
  min-height: 24px;
  padding: 0 10px;
  border-radius: 35px;
  background-color: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  line-height: 1;
  letter-spacing: 0;
  white-space: nowrap;
`;

export const DetailList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 24px 20px 24px;
`;

export const DetailBlock = styled.section`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const DetailTitle = styled.h3`
  font-size: 14px;
  line-height: 16px;
  color: #222222;
`;

export const FeatureText = styled.p`
  font-size: 13px;
  line-height: 1.5;
  color: #555555;
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

  &:disabled {
    cursor: default;
    background-color: #c9c4dc;
    filter: none;
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

  &:disabled {
    cursor: default;
    background-color: #ef9ca6;
    filter: none;
  }
`;
