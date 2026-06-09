import React, { useState, useEffect } from 'react'; // 💡 useEffect 추가
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// --- 데이터 정의 ---
interface AgeOption {
  id: string;
  title: string;
  range: string;
}

const AGE_OPTIONS: AgeOption[] = [
  { id: 'child', title: '어린이', range: '6 ~ 12세' },
  { id: 'youth', title: '청소년', range: '13 ~ 19세' },
  { id: 'adult', title: '성인', range: '20 ~ 64세' },
  { id: 'senior', title: '경로', range: '65세 이상' },
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

const BackIcon = styled.img`
  position: absolute;
  top: 17px;
  left: 24px;
  width: 17px;
  height: 34px;
  cursor: pointer;
  z-index: 15;
`;

const ProgressBarContainer = styled.div`
  position: absolute;
  top: 31px;
  left: 57px;
  width: 309px;
  height: 6px;
  background-color: #E9E9E9;
  border-radius: 3px;
`;

// 💡 width를 props로 동적 제어하고, transition을 넣어 부드럽게 늘어나도록 변경
const ProgressBarFill = styled.div<{ $width: number }>`
  width: ${({ $width }) => $width}%; 
  height: 100%;
  background-color: #EC5665;
  border-radius: 3px;
  transition: width 0.4s ease-out; /* 0.4초 동안 부드럽게 차오름 */
`;

const Title = styled.h1`
  position: absolute;
  top: 64px;
  left: 76px; 
  font-family: 'Gmarket Sans', sans-serif;
  font-size: 24px;
  font-weight: 500; 
  color: #222222;
  margin: 0;
`;

const OptionsContainer = styled.div`
  position: absolute;
  top: 134px;
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
const Age: React.FC = () => {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // 💡 프로그레스 바의 너비를 제어할 상태 추가 (처음엔 0)
  const [progressWidth, setProgressWidth] = useState(0);

  // 💡 화면이 켜지자마자 0에서 33.3으로 늘어나도록 유도
  useEffect(() => {
    // 리액트 렌더링 사이클 직후 타이머를 살짝 주어 부드럽게 작동하게 만듭니다.
    const timer = setTimeout(() => {
      setProgressWidth(33.3);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <PageWrapper>
      <MobileContainer>
        <BackIcon
          src="/assets/icons/back_icon.svg"
          alt="Back"
          onClick={() => navigate('/survey/information')}
        />

        <ProgressBarContainer>
          {/* 💡 동적 상태 값을 전달합니다. */}
          <ProgressBarFill $width={progressWidth} />
        </ProgressBarContainer>

        <Title>연령대를 선택해주세요</Title>

        <OptionsContainer>
          {AGE_OPTIONS.map((option) => (
            <CardBox
              key={option.id}
              $isSelected={selectedId === option.id}
              onClick={() => setSelectedId(option.id)}
            >
              <CardTitle>{option.title}</CardTitle>
              <CardRange>{option.range}</CardRange>
            </CardBox>
          ))}
        </OptionsContainer>

        <NextButton 
          $isActive={selectedId !== null}
          disabled={selectedId === null}
          onClick={() => navigate('/survey/gender')} 
        >
          다음
        </NextButton>
      </MobileContainer>
    </PageWrapper>
  );
};

export default Age;
