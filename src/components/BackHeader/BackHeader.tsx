import * as S from './BackHeader.styled';

type BackHeaderColor = 'light' | 'dark';

interface BackHeaderProps {
  title: string;
  onBack?: () => void;
  color?: BackHeaderColor;
}

function BackHeader({ title, onBack, color = 'dark' }: BackHeaderProps) {
  return (
    <S.Header>
      <S.BackButton type="button" onClick={onBack} aria-label="뒤로 가기">
        <S.Icon $color={color} aria-hidden="true" />
        <S.Title $color={color}>{title}</S.Title>
      </S.BackButton>
    </S.Header>
  );
}

export default BackHeader;
