import * as S from './CameraFrame.styled';

interface CameraFrameProps {
  hint?: string;
  onCapture: () => void;
}

function CameraFrame({
  hint = '보이는 칸에 알맞게 명함을 비춰주세요',
  onCapture,
}: CameraFrameProps) {
  return (
    <S.Wrapper
      role="button"
      tabIndex={0}
      onClick={onCapture}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onCapture();
      }}
      aria-label="명함 촬영"
    >
      <S.Frame />
      <S.Hint>{hint}</S.Hint>
    </S.Wrapper>
  );
}

export default CameraFrame;
