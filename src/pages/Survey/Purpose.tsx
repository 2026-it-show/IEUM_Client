import React, { useState, useEffect } from 'react'; // 💡 useEffect 추가
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// --- 데이터 정의 ---
interface AgeOption {
  id: string;
  title: string;
  text: string;
}

const AGE_OPTIONS: AgeOption[] = [
  { id: 'employment', title: '채용', text: '학생 채용 목적' },
  { id: 'viewing', title: '관람', text: '전시 작품 관람 목적' },
];

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

const BackIcon = styled.img`
  position: absolute;
  top: 65px;
  left: 24px;
  width: 17px;
  height: 34px;
  cursor: pointer;
  z-index: 15;
`;

const ProgressBarContainer = styled.div`
  position: absolute;
  top: 79px;
  left: 57px;
  width: 309px;
  height: 6px;
  background-color: #E9E9E9;
  border-radius: 3px;
`;

const ProgressBarFill = styled.div<{ $width: number }>`
  width: ${({ $width }) => $width}%; 
  height: 100%;
  background-color: #EC5665;
  border-radius: 3px;
  transition: width 0.4s ease-out; /* 0.4초 동안 부드럽게 차오름 */
`;

const Title = styled.h1`
  position: absolute;
  top: 112px;
  left: 61px; 
  font-family: 'Gmarket Sans', sans-serif;
  font-size: 24px;
  font-weight: 500; 
  color: #222222;
  margin: 0;
`;

const OptionsContainer = styled.div`
  position: absolute;
  top: 182px; 
  left: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px; 
`;

const CardBox = styled.div<{ $isSelected: boolean }>`
  width: 342px;
  height: 91px;
  border-radius: 12px;
  position: relative; 
  box-sizing: border-box;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  border: 1px solid ${({ $isSelected }) => ($isSelected ? '#EC5665' : '#D9D9D9')};
  background-color: ${({ $isSelected }) => ($isSelected ? 'rgba(236, 86, 101, 0.2)' : '#FFFFFF')};
`;

const CardTitle = styled.span`
  font-family: 'Gmarket Sans', sans-serif;
  font-size: 20px;
  font-weight: 500;
  color: #222222;
  position: absolute;
  left: 28px;
  top: 23px;
  line-height: 1;
`;

const CardRange = styled.span`
  font-family: 'Gmarket Sans', sans-serif;
  font-size: 14px;
  color: #555555;
  position: absolute;
  left: 28px;
  top: 53px;
  line-height: 1;
`;

const NextButton = styled.button<{ $isActive: boolean }>`
  position: absolute;
  bottom: 29px;
  left: 24px;
  width: 342px;
  height: 52px;
  border-radius: 12px;
  border: none;
  font-family: 'Gmarket Sans', sans-serif;
  font-size: 20px;
  font-weight: 500;
  color: #ffffff;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  background-color: ${({ $isActive }) => ($isActive ? '#EC5665' : '#B3B3B3')};
`;

// --- 컴포넌트 ---
const Purpose: React.FC = () => {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // 💡 성별 선택 페이지의 최종 위치인 66.6%에서 시작하도록 초기값 설정
  const [progressWidth, setProgressWidth] = useState(66.6);

  useEffect(() => {
    const timer = setTimeout(() => {
      // 💡 마지막 페이지이므로 100% 꽉 차게 변경
      setProgressWidth(100);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <PageWrapper>
      <MobileContainer>
        <NavImage src="/assets/nav.svg" alt="Navigation Bar" />

        <BackIcon
          src="/assets/icons/back_icon.svg"
          alt="Back"
          onClick={() => navigate('/survey/gender')}
        />

        <ProgressBarContainer>
          <ProgressBarFill $width={progressWidth} />
        </ProgressBarContainer>

        <Title>관람 목적을 선택해주세요</Title>

        <OptionsContainer>
          {AGE_OPTIONS.map((option) => (
            <CardBox
              key={option.id}
              $isSelected={selectedId === option.id}
              onClick={() => setSelectedId(option.id)}
            >
              <CardTitle>{option.title}</CardTitle>
              <CardRange>{option.text}</CardRange>
            </CardBox>
          ))}
        </OptionsContainer>

        <NextButton 
          $isActive={selectedId !== null}
          disabled={selectedId === null}
          onClick={() => {
            if (selectedId === 'employment') {
              navigate('/business-card');
            } else {
              navigate('/app');
            }
          }} 
        >
          다음
        </NextButton>
      </MobileContainer>
    </PageWrapper>
  );
};

export default Purpose;