import { useState } from 'react';
import { PrimaryButton } from '@/components';
import * as S from './FeedbackFormSection.styled';

interface FeedbackFormSectionProps {
  onSubmit: (message: string) => void;
}

function FeedbackFormSection({ onSubmit }: FeedbackFormSectionProps) {
  const [message, setMessage] = useState('');

  return (
    <S.Wrapper>
      <S.Textarea
        placeholder="학생들을 위한 소중한 의견을 남겨주세요"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <S.BottomCTA>
        <PrimaryButton
          disabled={message.trim().length < 2}
          onClick={() => onSubmit(message.trim())}
        >
          확인
        </PrimaryButton>
      </S.BottomCTA>
    </S.Wrapper>
  );
}

export default FeedbackFormSection;
