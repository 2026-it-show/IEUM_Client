import * as S from './PrototypeGuideOverlay.styled';

interface PrototypeGuideOverlayProps {
  message?: string;
  onDismiss: () => void;
}

function PrototypeGuideOverlay({
  message = '프로젝트에 대한 피드백을 남기거나\n채용 의사를 밝힐 수 있습니다',
  onDismiss,
}: PrototypeGuideOverlayProps) {
  return (
    <S.Overlay
      role="button"
      tabIndex={0}
      aria-label="가이드 닫기"
      onClick={onDismiss}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onDismiss();
      }}
    >
      <S.Anchor>
        <S.Caption>{message}</S.Caption>
        <S.Arrow
          viewBox="0 0 70 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M15 12 C 25 18, 45 30, 58 56"
            stroke="#FFFFFF"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeDasharray="3 4"
            fill="none"
          />
          <path
            d="M8 14 L 15 6 L 22 14"
            stroke="#FFFFFF"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </S.Arrow>
      </S.Anchor>
    </S.Overlay>
  );
}

export default PrototypeGuideOverlay;
