import { useState } from 'react';
import { PrimaryButton } from '@/components';
import { DUMMY_TEAM_MEMBERS } from '@/data';
import * as S from './HireFormSection.styled';

interface HireFormSectionProps {
  onSubmit: (memberId: string) => void;
}

function HireFormSection({ onSubmit }: HireFormSectionProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <S.Wrapper>
      <S.ScrollArea>
        {DUMMY_TEAM_MEMBERS.map((member) => (
          <S.MemberCard
            key={member.id}
            type="button"
            $selected={selectedId === member.id}
            onClick={() => setSelectedId(member.id)}
          >
            <S.MemberName>{member.name}</S.MemberName>
            <S.MemberRole>{member.role}</S.MemberRole>
          </S.MemberCard>
        ))}
      </S.ScrollArea>

      <S.BottomCTA>
        <PrimaryButton
          disabled={!selectedId}
          onClick={() => selectedId && onSubmit(selectedId)}
        >
          채용 희망
        </PrimaryButton>
      </S.BottomCTA>
    </S.Wrapper>
  );
}

export default HireFormSection;
