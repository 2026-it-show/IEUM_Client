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
  padding: 26px ${({ theme }) => theme.layout.pagePadding}
    calc(${({ theme }) => theme.layout.bottomCTAOffset} + 56px + 40px);
  scroll-behavior: smooth;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
    display: none;
  }
`;

export const Title = styled.h1`
  font-size: 24px;
  line-height: 1.3;
  color: ${({ theme }) => theme.colors.black};
  margin-bottom: 30px;
`;

export const FieldList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0 12px;
`;

export const ScrollFade = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 160px;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.85) 45%,
    rgba(255, 255, 255, 1) 70%
  );
  pointer-events: none;
`;

export const BottomCTA = styled.div`
  position: absolute;
  left: ${({ theme }) => theme.layout.pagePadding};
  right: ${({ theme }) => theme.layout.pagePadding};
  bottom: ${({ theme }) => theme.layout.bottomCTAOffset};
`;
