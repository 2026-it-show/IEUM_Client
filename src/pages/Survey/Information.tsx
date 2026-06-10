import React, { useState } from 'react';
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

const Title = styled.h1`
  position: absolute;
  top: clamp(48px, 7.6dvh, 64px);
  left: 24px;
  right: 24px;
  font-family: 'Gmarket Sans', sans-serif;
  font-size: 24px;
  font-weight: medium;
  line-height: 1.4;
  color: #222222;
  margin: 0;
  white-space: pre-wrap;
`;

// 전체 동의 박스
const AgreementBox = styled.div<{ $isChecked: boolean }>`
  position: absolute;
  top: clamp(150px, 21.6dvh, 182px);
  left: 24px;
  right: 24px;
  height: clamp(76px, 10.8dvh, 91px);
  border-radius: 12px;
  display: flex;
  align-items: center;
  padding-left: 28px;
  cursor: pointer;
  box-sizing: border-box;
  transition: all 0.2s ease-in-out;

  border: 1px solid ${({ $isChecked }) => ($isChecked ? '#EC5665' : '#D9D9D9')};
  background-color: ${({ $isChecked }) => ($isChecked ? 'rgba(236, 86, 101, 0.2)' : '#FFFFFF')};
`;

const AgreementText = styled.span`
  font-size: 20px;
  color: #222222;
`;

const LinkListContainer = styled.div`
  position: absolute;
  top: clamp(254px, 35.7dvh, 301px);
  left: 36px;
  right: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const LinkItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
`;

const CheckIcon = styled.span<{ $isChecked: boolean }>`
  font-size: 17px;
  color: ${({ $isChecked }) => ($isChecked ? '#EC5665' : '#D9D9D9')};
  font-weight: bold;
`;

const LinkText = styled.span`
  font-size: 14px;
  color: #777777;
  text-decoration: underline;
  text-underline-offset: 3px;
`;

const NextButton = styled.button<{ $isChecked: boolean }>`
  position: absolute;
  bottom: calc(24px + env(safe-area-inset-bottom, 0px));
  left: 24px;
  right: 24px;
  height: clamp(52px, 6.5dvh, 55px);
  border-radius: 12px;
  border: none;
  font-size: 20px;
  color: #ffffff;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  background-color: ${({ $isChecked }) => ($isChecked ? '#EC5665' : '#B9B9B9')};
`;

// --- 컴포넌트 ---
const Information: React.FC = () => {
  const navigate = useNavigate();
  const [isChecked, setIsChecked] = useState(false);

  // 전체 동의 토글 함수
  const handleToggle = () => {
    setIsChecked(!isChecked);
  };

  return (
    <PageWrapper>
      <MobileContainer>
        {/* 메인 타이틀 */}
        <Title>{`서비스 이용을 위한\n약관에 동의해주세요`}</Title>

        {/* 전체 동의하기 박스 */}
        <AgreementBox $isChecked={isChecked} onClick={handleToggle}>
          <AgreementText>전체 동의하기</AgreementText>
        </AgreementBox>

        {/* 개별 약관 링크 리스트 */}
        <LinkListContainer>
          <LinkItem onClick={() => navigate(withSurveyReturnTo('/survey/agreement1'))}>
            <CheckIcon $isChecked={isChecked}>✓</CheckIcon>
            <LinkText>[필수] 설문 응답 및 개인정보 수집·이용 동의</LinkText>
          </LinkItem>
          
          <LinkItem onClick={() => navigate(withSurveyReturnTo('/survey/agreement2'))}>
            <CheckIcon $isChecked={isChecked}>✓</CheckIcon>
            <LinkText>[필수] 개인정보 제3자 제공 동의</LinkText>
          </LinkItem>
        </LinkListContainer>

        {/* 하단 다음 버튼 */}
        <NextButton 
          $isChecked={isChecked} 
          disabled={!isChecked}
          onClick={() => navigate(withSurveyReturnTo('/survey/age'))}
        >
          다음
        </NextButton>
      </MobileContainer>
    </PageWrapper>
  );
};

export default Information;
