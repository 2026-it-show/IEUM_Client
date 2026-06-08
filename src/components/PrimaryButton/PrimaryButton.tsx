import type { ButtonHTMLAttributes, ReactNode } from 'react';
import * as S from './PrimaryButton.styled';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

function PrimaryButton({
  type = 'button',
  children,
  ...rest
}: PrimaryButtonProps) {
  return (
    <S.Button type={type} {...rest}>
      {children}
    </S.Button>
  );
}

export default PrimaryButton;
