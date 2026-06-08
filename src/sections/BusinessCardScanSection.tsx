import { CameraFrame } from '@/components';
import { DUMMY_BUSINESS_CARD } from '@/data';
import type { BusinessCard } from '@/data';
import * as S from './BusinessCardScanSection.styled';

interface BusinessCardScanSectionProps {
  onScanned: (card: BusinessCard) => void;
}

function BusinessCardScanSection({ onScanned }: BusinessCardScanSectionProps) {
  const handleCapture = () => {
    onScanned(DUMMY_BUSINESS_CARD);
  };

  return (
    <S.Wrapper>
      <CameraFrame onCapture={handleCapture} />
    </S.Wrapper>
  );
}

export default BusinessCardScanSection;
