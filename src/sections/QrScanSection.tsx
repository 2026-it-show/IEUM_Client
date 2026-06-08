import { CameraFrame } from '@/components';
import * as S from './QrScanSection.styled';

interface QrScanSectionProps {
  onScanned: () => void;
}

function QrScanSection({ onScanned }: QrScanSectionProps) {
  return (
    <S.Wrapper>
      <CameraFrame
        width={277}
        height={277}
        hint="보이는 칸에 알맞게 QR을 비춰주세요"
        ariaLabel="QR 스캔"
        onCapture={onScanned}
      />
    </S.Wrapper>
  );
}

export default QrScanSection;
