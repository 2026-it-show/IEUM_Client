import * as S from './PrototypeGuideOverlay.styled';

interface PrototypeGuideOverlayProps {
  message?: string;
  showFeedback?: boolean;
  onDismiss: () => void;
}

function PrototypeGuideOverlay({
  message = '프로젝트에 대한 피드백을 남기거나\n채용 의사를 밝힐 수 있습니다',
  showFeedback = true,
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
          src="/assets/icons/tutorial_arrow.svg"
          alt=""
          aria-hidden="true"
          draggable={false}
        />
      </S.Anchor>
      <S.ActionRow $single={!showFeedback}>
        {showFeedback ? <S.FeedbackButton>피드백</S.FeedbackButton> : null}
        <S.HireButton>채용</S.HireButton>
      </S.ActionRow>
    </S.Overlay>
  );
}

export default PrototypeGuideOverlay;
