import * as S from './CameraFrame.styled';

interface CameraFrameProps {
  hint?: string;
  width?: number;
  height?: number;
  ariaLabel?: string;
  onCapture: () => void;
}

function CameraFrame({
  hint = '보이는 칸에 알맞게 명함을 비춰주세요',
  width = 343,
  height = 206,
  ariaLabel = '명함 촬영',
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
      aria-label={ariaLabel}
    >
      <S.Frame $width={width} $height={height} />
      <S.Hint>{hint}</S.Hint>
    </S.Wrapper>
  );
}

export default CameraFrame;
