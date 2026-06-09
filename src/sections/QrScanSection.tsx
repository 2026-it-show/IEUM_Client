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
        setErrorMessage('카메라 권한을 허용하거나 QR 사진을 선택해주세요');
      });

    return () => {
      active = false;
      controls?.stop();
    };
  }, [onScanned]);

  const handleImageFile = async (file: File) => {
    setErrorMessage(null);
    try {
      const payload = await decodeQrImage(file);
      if (hasScannedRef.current) return;
      hasScannedRef.current = true;
      onScanned(payload);
    } catch {
      setErrorMessage('QR을 읽지 못했습니다. 더 선명한 사진을 선택해주세요');
    }
  };

  return (
    <S.Wrapper>
      <S.CameraArea>
        <S.Video ref={videoRef} playsInline muted autoPlay />
        <S.Frame aria-hidden="true" />
      </S.CameraArea>
      <S.Hint>보이는 칸에 알맞게 QR을 비춰주세요</S.Hint>
      {errorMessage ? <S.ErrorText>{errorMessage}</S.ErrorText> : null}
      <S.PhotoPicker>
        QR 사진 선택
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            event.currentTarget.value = '';
            if (file) void handleImageFile(file);
          }}
        />
      </S.PhotoPicker>
    </S.Wrapper>
  );
}

async function decodeQrImage(file: File): Promise<string> {
  const { BrowserQRCodeReader } = await import('@zxing/browser');
  const reader = new BrowserQRCodeReader();
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.src = url;
  await image.decode();
  try {
    const result = await reader.decodeFromImageElement(image);
    return result.getText();
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default QrScanSection;
