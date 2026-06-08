import type { InputHTMLAttributes } from 'react';
import * as S from './InputField.styled';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

function InputField({ label, ...rest }: InputFieldProps) {
  return (
    <S.Field>
      <S.Label>{label}</S.Label>
      <S.Input {...rest} />
    </S.Field>
  );
}

export default InputField;
