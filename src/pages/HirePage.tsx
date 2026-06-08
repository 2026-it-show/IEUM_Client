import { BackHeader } from '@/components';
import { HireFormSection } from '@/sections';
import * as S from './HirePage.styled';

interface HirePageProps {
  onBack: () => void;
  onSubmit: (memberId: string) => void;
}

function HirePage({ onBack, onSubmit }: HirePageProps) {
  return (
    <S.Page>
      <BackHeader title="채용 희망" onBack={onBack} />
      <HireFormSection onSubmit={onSubmit} />
    </S.Page>
  );
}

export default HirePage;
