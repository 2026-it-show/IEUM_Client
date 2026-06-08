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
      <S.BackButton
        type="button"
        onClick={onBack}
        aria-label="뒤로 가기"
        $color={color}
      >
        <svg
          width="11"
          height="20"
          viewBox="0 0 11 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M10 1L1.7071 9.29289C1.31658 9.68342 1.31658 10.3166 1.7071 10.7071L10 19"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <S.Title>{title}</S.Title>
      </S.BackButton>
    </S.Header>
  );
}

export default BackHeader;
