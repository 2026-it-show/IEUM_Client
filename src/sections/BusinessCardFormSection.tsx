import { InputField, PrimaryButton } from '@/components';
import { BUSINESS_CARD_FIELDS } from '@/data';
import type { BusinessCard, BusinessCardField } from '@/data';
import * as S from './BusinessCardFormSection.styled';

interface BusinessCardFormSectionProps {
  values: BusinessCard;
  onChange: (key: BusinessCardField, value: string) => void;
  onSubmit: () => void;
}

function BusinessCardFormSection({
  values,
  onChange,
  onSubmit,
}: BusinessCardFormSectionProps) {
  return (
    <S.Wrapper>
      <S.ScrollArea>
        <S.Title>하단 내용을 확인해주세요</S.Title>
        <S.FieldList>
          {BUSINESS_CARD_FIELDS.map(({ key, label }) => (
            <InputField
              key={key}
              label={label}
              value={values[key]}
              onChange={(e) => onChange(key, e.target.value)}
            />
          ))}
        </S.FieldList>
      </S.ScrollArea>
      <S.ScrollFade aria-hidden="true" />
      <S.BottomCTA>
        <PrimaryButton onClick={onSubmit}>다음</PrimaryButton>
      </S.BottomCTA>
    </S.Wrapper>
  );
}

export default BusinessCardFormSection;
