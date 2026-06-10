import { useState } from 'react';
import * as S from './MapTutorialOverlay.styled';

interface MapTutorialOverlayProps {
  onDismiss: () => void;
}

type TutorialStep = 'pinch' | 'qr';

function MapTutorialOverlay({ onDismiss }: MapTutorialOverlayProps) {
  const [step, setStep] = useState<TutorialStep>('pinch');
  const advance = () => {
    if (step === 'pinch') {
      setStep('qr');
      return;
    }
    onDismiss();
  };

  return (
    <S.Overlay
      role="button"
      tabIndex={0}
      aria-label="튜토리얼 닫기"
      onClick={advance}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') advance();
      }}
    >
      {step === 'pinch' ? (
        <S.PinchGuide>
          <S.PinchIcon
            src="/assets/icons/tutorial_pinch_icon.svg"
            alt=""
            aria-hidden="true"
            draggable={false}
          />
          <S.CenterCaption>
            두 손가락으로 확대를 하여
            <br />
            지도를 볼 수 있습니다
          </S.CenterCaption>
        </S.PinchGuide>
      ) : (
        <>
          <S.QrCaption>
            각 부스에 설치된 NFC를 태그 하시거나 QR을 인식하여
            <br />
            프로젝트에 대한 정보를 얻을 수 있습니다
          </S.QrCaption>
          <S.QrArrow
            src="/assets/icons/tutorial_arrow.svg"
            alt=""
            aria-hidden="true"
            draggable={false}
          />
          <S.QrSpot aria-hidden="true">QR</S.QrSpot>
        </>
      )}
    </S.Overlay>
  );
}

export default MapTutorialOverlay;
