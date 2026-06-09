import { BackHeader } from '@/components';
import { QrScanSection } from '@/sections';
import * as S from './QrScanPage.styled';

interface QrScanPageProps {
  onBack: () => void;
  onScanned: (payload: string) => void;
}

function QrScanPage({ onBack, onScanned }: QrScanPageProps) {
  return (
    <S.Page>
      <BackHeader title="QR" onBack={onBack} color="light" />
      <QrScanSection onScanned={onScanned} />
    </S.Page>
  );
}

export default QrScanPage;
