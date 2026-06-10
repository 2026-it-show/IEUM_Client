import { useEffect, useRef, useState } from 'react';
import * as S from './QrScanSection.styled';

interface QrScanSectionProps {
  onScanned: (payload: string) => void;
}

function QrScanSection({ onScanned }: QrScanSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasScannedRef = useRef(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let active = true;
    let controls: { stop: () => void } | null = null;

    void import('@zxing/browser')
      .then(({ BrowserQRCodeReader }) => {
        if (!active) return null;
        const reader = new BrowserQRCodeReader();
        return reader
          .decodeFromVideoDevice(undefined, video, (result) => {
            if (!active || !result || hasScannedRef.current) return;
            hasScannedRef.current = true;
            controls?.stop();
            onScanned(result.getText());
          })
          .then((scannerControls) => {
            controls = scannerControls;
            return null;
          });
      })
      .catch(() => {
        setErrorMessage('카메라 권한을 허용해주세요');
      });

    return () => {
      active = false;
      controls?.stop();
    };
  }, [onScanned]);

  return (
    <S.Wrapper>
      <S.CameraArea>
        <S.Video ref={videoRef} playsInline muted autoPlay />
        <S.Frame aria-hidden="true" />
      </S.CameraArea>
      <S.Hint>보이는 칸에 알맞게 QR을 비춰주세요</S.Hint>
      {errorMessage ? <S.ErrorText>{errorMessage}</S.ErrorText> : null}
    </S.Wrapper>
  );
}

export default QrScanSection;
