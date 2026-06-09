import React, { useState, useEffect } from 'react'; // 💡 useEffect 추가
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// --- 데이터 정의 ---
interface AgeOption {
  id: string;
  title: string;
}

const AGE_OPTIONS: AgeOption[] = [
  { id: 'male', title: '남성'},
  { id: 'female', title: '여성'},
];

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
  top: clamp(24px, 3.7dvh, 31px);
  left: 57px;
  right: 24px;
  height: 6px;
  background-color: #E9E9E9;
  border-radius: 3px;
`;

// 💡 width를 props로 동적 제어하고, transition 성능을 위해 ease-out 스타일 유지
const ProgressBarFill = styled.div<{ $width: number }>`
  width: ${({ $width }) => $width}%; 
  height: 100%;
  background-color: #EC5665;
  border-radius: 3px;
  transition: width 0.4s ease-out; /* 0.4초 동안 자연스럽게 차오름 */
`;

const Title = styled.h1`
  position: absolute;
  top: clamp(52px, 7.6dvh, 64px);
  left: 24px;
  right: 24px;
  font-family: 'Gmarket Sans', sans-serif;
  font-size: 24px;
  font-weight: 500; 
  color: #222222;
  margin: 0;
  text-align: center;
`;

const OptionsContainer = styled.div`
  position: absolute;
  top: clamp(112px, 15.9dvh, 134px);
  left: 24px;
  right: 24px;
  display: flex;
  flex-direction: column;
  gap: clamp(9px, 1.4dvh, 12px);
`;

const CardBox = styled.div<{ $isSelected: boolean }>`
  width: 100%;
  height: clamp(76px, 10.8dvh, 91px);
  border-radius: 12px;
  display: flex;
  align-items: center;
  padding: 0 28px;
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
  line-height: 1;
`;

const NextButton = styled.button<{ $isActive: boolean }>`
  position: absolute;
  bottom: calc(24px + env(safe-area-inset-bottom, 0px));
  left: 24px;
  right: 24px;
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
const Gender: React.FC = () => {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // 💡 1단계 위치인 33.3%에서 시작하도록 초기값 설정
  const [progressWidth, setProgressWidth] = useState(33.3);

  // 💡 화면이 켜지자마자 33.3%에서 66.6%로 부드럽게 차오르도록 유도
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgressWidth(66.6);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <PageWrapper>
      <MobileContainer>
        <BackIcon
          src="/assets/icons/back_icon.svg"
          alt="Back"
          draggable={false}
          onClick={() => navigate('/survey/age')}
        />

        <ProgressBarContainer>
          {/* 💡 동적으로 변화하는 상태 값을 주입합니다 */}
          <ProgressBarFill $width={progressWidth} />
        </ProgressBarContainer>

        <Title>성별을 선택해주세요</Title>

        <OptionsContainer>
          {AGE_OPTIONS.map((option) => (
            <CardBox
              key={option.id}
              $isSelected={selectedId === option.id}
              onClick={() => setSelectedId(option.id)}
            >
              <CardTitle>{option.title}</CardTitle>
            </CardBox>
          ))}
        </OptionsContainer>

        <NextButton 
          $isActive={selectedId !== null}
          disabled={selectedId === null}
          onClick={() => navigate('/survey/purpose')} 
        >
          다음
        </NextButton>
      </MobileContainer>
    </PageWrapper>
  );
};

export default Gender;
