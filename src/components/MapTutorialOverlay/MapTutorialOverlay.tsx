import * as S from './MapTutorialOverlay.styled';

interface MapTutorialOverlayProps {
  onDismiss: () => void;
}

function MapTutorialOverlay({ onDismiss }: MapTutorialOverlayProps) {
  return (
    <S.Overlay
      role="button"
      tabIndex={0}
      aria-label="튜토리얼 닫기"
      onClick={onDismiss}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onDismiss();
      }}
    >
      <S.TopHint>
        <S.HintText>관심 있는 분야나 부스를 눌러 프로젝트를 확인해보세요</S.HintText>
      </S.TopHint>
      <S.QrHint>
        <S.Arrow
          viewBox="0 0 68 58"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M8 8 C 20 17, 43 32, 56 51"
            stroke="white"
            strokeLinecap="round"
            strokeDasharray="3 4"
            strokeWidth="1.6"
          />
          <path
            d="M3 15 L 8 7 L 17 10"
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.6"
          />
        </S.Arrow>
        <S.HintText>부스에서 QR을 찍으면 피드백과 채용 의사를 남길 수 있습니다</S.HintText>
      </S.QrHint>
      <S.DismissChip>화면을 눌러 시작</S.DismissChip>
    </S.Overlay>
  );
}

export default MapTutorialOverlay;
