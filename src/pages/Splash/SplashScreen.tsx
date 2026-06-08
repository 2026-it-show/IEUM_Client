import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

const moveAndFadeOut = keyframes`
  0% { left: 160px; opacity: 1; }
  20% { left: 160px; opacity: 1; }
  60% { left: 45px; opacity: 1; }
  80% { left: 45px; opacity: 0; }
  100% { left: 45px; opacity: 0; }
`;

const fadeIn = keyframes`
  0% { opacity: 0; }
  60% { opacity: 0; }
  80% { opacity: 1; }
  100% { opacity: 1; }
`;

const PageWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: #ffffff;
`;

const MobileContainer = styled.div<{ $isExiting: boolean }>`
  width: 390px;
  height: 844px;
  background-color: #EC5665;
  position: relative;
  margin: 0 auto;
  overflow: hidden;
  transition: opacity 0.5s ease-in-out;
  opacity: ${({ $isExiting }) => ($isExiting ? 0 : 1)};
`;

const NavImage = styled.img`
  width: 390px;
  height: 48px;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
`;

const SmallLogo = styled.img`
  width: 70px;
  height: 70px;
  position: absolute;
  top: 391px;
  animation: ${moveAndFadeOut} 2.5s ease-in-out forwards;
`;

const LargeLogo = styled.img`
  width: 300px;
  height: 70px;
  position: absolute;
  top: 391px;
  left: 45px;
  animation: ${fadeIn} 2.5s ease-in-out forwards;
`;

const SplashScreen: React.FC = () => {
    const navigate = useNavigate();
    const [isExiting, setIsExiting] = useState(false);

    const handleAnimationEnd = () => {
        setIsExiting(true);
        setTimeout(() => {
            // 주소창을 /survey/information 으로 안전하게 이동시킵니다.
            navigate('/survey/information');
        }, 500);
    };

    return (
        <PageWrapper>
            <MobileContainer $isExiting={isExiting}>
                {/* 1. 상단 Nav 이미지 */}
                <NavImage src="/assets/nav.svg" alt="Navigation Bar" />

                {/* 2. 작은 로고 */}
                <SmallLogo src="/assets/logo_1.svg" alt="작은 로고" />

                {/* 3. 큰 로고 (애니메이션이 완전히 끝나는 2.5초 시점에 handleAnimationEnd를 실행) */}
                <LargeLogo
                    src="/assets/logo_2.svg"
                    alt="큰 로고"
                    onAnimationEnd={handleAnimationEnd}
                />
            </MobileContainer>
        </PageWrapper>
    );
};

export default SplashScreen;