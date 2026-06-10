import { InputField, PrimaryButton } from '@/components';
import { BUSINESS_CARD_FIELDS } from '@/data';
import type { BusinessCard, BusinessCardField } from '@/data';
import * as S from './BusinessCardFormSection.styled';

interface BusinessCardFormSectionProps {
  values: BusinessCard;
  isLoading: boolean;
  onChange: (key: BusinessCardField, value: string) => void;
  onSubmit: () => void;
}

function BusinessCardFormSection({
  values,
  isLoading,
  onChange,
  onSubmit,
}: BusinessCardFormSectionProps) {
  return (
    <S.Wrapper aria-busy={isLoading}>
      <S.ScrollArea>
        <S.Title>하단 내용을 확인해주세요</S.Title>
        {isLoading ? (
          <S.LoadingPanel role="status" aria-live="polite">
            <S.Spinner aria-hidden="true" />
            <S.LoadingTitle>OCR 결과를 불러오는 중입니다</S.LoadingTitle>
            <S.LoadingDescription>
              명함 정보를 읽고 있어요. 잠시만 기다려주세요.
            </S.LoadingDescription>
          </S.LoadingPanel>
        ) : (
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
        )}
      </S.ScrollArea>
      <S.ScrollFade aria-hidden="true" />
      <S.BottomCTA>
        <PrimaryButton onClick={onSubmit} disabled={isLoading}>
          {isLoading ? '불러오는 중' : '다음'}
        </PrimaryButton>
      </S.BottomCTA>
    </S.Wrapper>
  );
}

export default BusinessCardFormSection;
