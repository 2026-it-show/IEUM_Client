import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// --- 스타일드 컴포넌트 ---

const PageWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: #ffffff;
`;

const MobileContainer = styled.div`
  width: 390px;
  height: 844px;
  background-color: #ffffff;
  position: relative; 
  margin: 0 auto;
  box-sizing: border-box;
`;

const NavImage = styled.img`
  width: 390px;
  height: 48px;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
`;

// 뒤로가기 아이콘 (17 * 34)
const BackIcon = styled.img`
  position: absolute;
  top: 65px;
  left: 24px;
  width: 17px;
  height: 34px;
  cursor: pointer;
  z-index: 15; /* 상단 바 위에 배치되어 확실하게 클릭되도록 설정 */
`;

// 상단 타이틀 텍스트 (지마켓 산스 미디엄, 16px)
const HeaderTitle = styled.h2`
  position: absolute;
  top: 74px;
  left: 57px;
  margin: 0;
  font-family: 'Gmarket Sans', sans-serif;
  font-weight: 500; /* 미디엄 두께 */
  font-size: 16px;
  color: #111111;
  line-height: 1;
`;

// 약관 본문 이미지 (350 * 495)
const AgreementImage = styled.img`
  position: absolute;
  top: 125px;
  left: 20px;
  width: 350px;
  height: 495px;
  object-fit: contain;
`;

// --- 컴포넌트 ---
const Agreement1: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <MobileContainer>
        {/* 1. 상단 내비게이션 바 */}
        <NavImage src="/assets/nav.svg" alt="Navigation Bar" />

        {/* 2. 뒤로가기 버튼 (클릭 시 설문 정보 페이지로 리다이렉트) */}
        <BackIcon 
          src="/assets/icons/back_icon.svg" 
          alt="Back" 
          onClick={() => navigate('/survey/information')} 
        />

        {/* 3. 헤더 타이틀 */}
        <HeaderTitle>설문 응답 및 개인정보 수집·이용 동의</HeaderTitle>

        {/* 4. 약관 상세 이미지 */}
        <AgreementImage src="/assets/agreement1.svg" alt="약관 내용" />
      </MobileContainer>
    </PageWrapper>
  );
};

export default Agreement1;