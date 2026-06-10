import * as S from './BackHeader.styled';

type BackHeaderColor = 'light' | 'dark';

interface BackHeaderProps {
  title: string;
  onBack?: () => void;
  color?: BackHeaderColor;
  compact?: boolean;
  bandText?: string;
  bandColor?: string;
  surface?: 'default' | 'scan';
}

function BackHeader({
  title,
  onBack,
  color = 'dark',
  compact = false,
  bandText,
  bandColor,
  surface = 'default',
}: BackHeaderProps) {
  return (
    <S.AppBar $surface={surface}>
      <S.Header $compact={compact}>
        <S.BackButton
          type="button"
          onClick={onBack}
          aria-label="뒤로 가기"
          $color={color}
        >
          <S.BackIcon
            src="/assets/icons/back_icon.svg"
            alt=""
            aria-hidden="true"
            $color={color}
          />
          <S.Title>{title}</S.Title>
        </S.BackButton>
      </S.Header>
      {bandText ? (
        <S.Band $background={bandColor ?? '#D88E70'}>{bandText}</S.Band>
      ) : null}
    </S.AppBar>
  );
}

export default BackHeader;
