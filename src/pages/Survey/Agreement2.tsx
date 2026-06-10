import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { withSurveyReturnTo } from '@/utils/surveyReturn';

// --- 스타일드 컴포넌트 ---

const PageWrapper = styled.div`
  width: 100%;
  height: 100%;
  min-height: 0;
  background-color: #ffffff;
  overflow: hidden;
  overscroll-behavior: contain;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
`;

const MobileContainer = styled.div`
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  position: relative; 
  margin: 0 auto;
  box-sizing: border-box;
  overflow: hidden;
`;

// 뒤로가기 아이콘 (17 * 34)
const BackIcon = styled.img`
  position: absolute;
  top: 17px;
  left: 24px;
  width: 17px;
  height: 34px;
  cursor: pointer;
  z-index: 15; /* 상단 바 위에 배치되어 확실하게 클릭되도록 설정 */
`;

// 상단 타이틀 텍스트 (지마켓 산스 미디엄, 16px)
const HeaderTitle = styled.h2`
  position: absolute;
  top: 26px;
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
  top: 77px;
  left: 20px;
  right: 20px;
  width: auto;
  height: min(451px, calc(100% - 112px));
  object-fit: contain;
`;

// --- 컴포넌트 ---
const Agreement2: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <MobileContainer>
        {/* 2. 뒤로가기 버튼 (클릭 시 설문 정보 페이지로 리다이렉트) */}
        <BackIcon 
          src="/assets/icons/back_icon.svg" 
          alt="Back" 
          draggable={false}
          onClick={() => navigate(withSurveyReturnTo('/survey/information'))} 
        />

        {/* 3. 헤더 타이틀 */}
        <HeaderTitle>개인정보 제3자 제공 동의</HeaderTitle>

        {/* 4. 약관 상세 이미지 */}
        <AgreementImage src="/assets/agreement2.svg" alt="약관 내용" />
      </MobileContainer>
    </PageWrapper>
  );
};

export default Agreement2;
