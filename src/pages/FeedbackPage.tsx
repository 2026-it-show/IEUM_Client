import { BackHeader } from '@/components';
import { FeedbackFormSection } from '@/sections';
import * as S from './FeedbackPage.styled';

interface FeedbackPageProps {
  onBack: () => void;
  onSubmit: (message: string) => void;
}

function FeedbackPage({ onBack, onSubmit }: FeedbackPageProps) {
  return (
    <S.Page>
      <BackHeader title="피드백 남기기" onBack={onBack} />
      <FeedbackFormSection onSubmit={onSubmit} />
    </S.Page>
  );
}

export default FeedbackPage;
