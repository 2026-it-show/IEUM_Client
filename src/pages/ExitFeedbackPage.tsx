import { useState } from 'react';
import * as S from './ExitFeedbackPage.styled';

export type ExitFeedbackSubmitResult =
  | 'blocked'
  | 'duplicate'
  | 'error'
  | 'success';

interface ExitFeedbackPageProps {
  readonly onSubmit: (message: string) => Promise<ExitFeedbackSubmitResult>;
}

function ExitFeedbackPage({ onSubmit }: ExitFeedbackPageProps) {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const trimmedMessage = message.trim();
  const canSubmit = trimmedMessage.length >= 2 && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setStatus(null);
    const result = await onSubmit(trimmedMessage);
    if (result === 'blocked') {
      setStatus('부적절한 표현이 포함되어 있어요. 다시 작성해주세요');
      setIsSubmitting(false);
      return;
    }
    if (result === 'duplicate') {
      setStatus('이미 의견을 남겼습니다');
      setIsSubmitting(false);
      return;
    }
    if (result === 'error') {
      setStatus('의견 전송에 실패했습니다');
      setIsSubmitting(false);
    }
  };

  return (
    <S.Page>
      <S.Title>서비스가 종료되었습니다!</S.Title>
      <S.FormBox>
        <S.Textarea
          placeholder="더 나은 서비스를 위해 의견을 남겨주세요"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          aria-label="이음 서비스 피드백"
        />
      </S.FormBox>
      {status ? <S.StatusMessage>{status}</S.StatusMessage> : null}
      <S.BottomButton
        type="button"
        disabled={!canSubmit}
        onClick={handleSubmit}
      >
        {isSubmitting ? '전송 중' : '종료'}
      </S.BottomButton>
    </S.Page>
  );
}

export default ExitFeedbackPage;
