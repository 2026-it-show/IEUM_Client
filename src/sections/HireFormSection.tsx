import { useState } from 'react';
import { PrimaryButton } from '@/components';
import * as S from './HireFormSection.styled';

export interface HireMember {
  id: string;
  name: string;
  role: string;
}

interface HireFormSectionProps {
  members: HireMember[];
  onSubmit: (memberId: string) => void;
}

function HireFormSection({ members, onSubmit }: HireFormSectionProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <S.Wrapper>
      <S.ScrollArea>
        {members.length === 0 ? (
          <S.EmptyText>등록된 팀원이 없습니다</S.EmptyText>
        ) : null}
        {members.map((member) => (
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
          disabled={!selectedId || members.length === 0}
          onClick={() => selectedId && onSubmit(selectedId)}
        >
          채용 희망
        </PrimaryButton>
      </S.BottomCTA>
    </S.Wrapper>
  );
}

export default HireFormSection;
