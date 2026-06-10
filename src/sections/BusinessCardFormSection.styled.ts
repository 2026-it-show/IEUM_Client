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

export const LoadingPanel = styled.div`
  min-height: 320px;
  padding: 40px 24px;
  margin: 0 12px;
  border: 1px solid ${({ theme }) => theme.colors.gray200};
  border-radius: ${({ theme }) => theme.radius.md};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  text-align: center;
  background-color: ${({ theme }) => theme.colors.white};
`;

export const Spinner = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 3px solid ${({ theme }) => theme.colors.gray200};
  border-top-color: ${({ theme }) => theme.colors.primary};
  animation: ieum-spin 0.8s linear infinite;

  @keyframes ieum-spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const LoadingTitle = styled.p`
  margin: 8px 0 0;
  color: ${({ theme }) => theme.colors.black};
  font-size: 18px;
  line-height: 1.35;
`;

export const LoadingDescription = styled.p`
  max-width: 220px;
  margin: 0;
  color: ${({ theme }) => theme.colors.gray500};
  font-size: 14px;
  line-height: 1.5;
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
