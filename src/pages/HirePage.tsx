import { BackHeader } from '@/components';
import { HireFormSection } from '@/sections';
import type { HireMember } from '@/sections/HireFormSection';
import * as S from './HirePage.styled';

interface HirePageProps {
  members: HireMember[];
  onBack: () => void;
  onSubmit: (memberId: string) => void;
  onViewMemberProjects?: (member: HireMember) => void;
}

function HirePage({
  members,
  onBack,
  onSubmit,
  onViewMemberProjects,
}: HirePageProps) {
  return (
    <S.Page>
      <BackHeader title="채용 희망" onBack={onBack} />
      <HireFormSection
        members={members}
        onSubmit={onSubmit}
        onViewMemberProjects={onViewMemberProjects}
      />
    </S.Page>
  );
}

export default HirePage;
