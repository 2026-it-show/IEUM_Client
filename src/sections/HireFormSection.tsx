import { useState } from 'react';
import { PrimaryButton } from '@/components';
import * as S from './HireFormSection.styled';

export interface HireMember {
  id: string;
  name: string;
  role: string;
  hired?: boolean;
}

interface HireFormSectionProps {
  members: HireMember[];
  onSubmit: (memberId: string) => void;
  onViewMemberProjects?: (member: HireMember) => void;
}

function HireFormSection({
  members,
  onSubmit,
  onViewMemberProjects,
}: HireFormSectionProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedMember = members.find(
    (member) => member.id === selectedId && !member.hired,
  );

  return (
    <S.Wrapper>
      <S.ScrollArea>
        {members.length === 0 ? (
          <S.EmptyText>등록된 팀원이 없습니다</S.EmptyText>
        ) : null}
        {members.map((member) => (
          <S.MemberItem key={member.id}>
            <S.MemberCard
              type="button"
              $selected={selectedMember?.id === member.id}
              $hired={Boolean(member.hired)}
              disabled={member.hired}
              onClick={() => {
                if (member.hired) return;
                setSelectedId(member.id);
              }}
            >
              <S.MemberName $selected={selectedMember?.id === member.id}>
                {member.name}
              </S.MemberName>
              <S.MemberRole>{member.role}</S.MemberRole>
              {member.hired ? (
                <S.HiredBadge>채용 의사 전달됨</S.HiredBadge>
              ) : null}
            </S.MemberCard>
            {onViewMemberProjects && selectedMember?.id === member.id ? (
              <S.OtherProjectsRow>
                <S.OtherProjectsText>
                  {member.name} 학생의 다른 프로젝트를 구경하시겠습니까?
                </S.OtherProjectsText>
                <S.OtherProjectsLink
                  type="button"
                  onClick={() => onViewMemberProjects(member)}
                >
                  보러가기
                </S.OtherProjectsLink>
              </S.OtherProjectsRow>
            ) : null}
          </S.MemberItem>
        ))}
      </S.ScrollArea>

      <S.BottomCTA>
        <PrimaryButton
          disabled={!selectedMember}
          onClick={() => selectedMember && onSubmit(selectedMember.id)}
        >
          채용 희망
        </PrimaryButton>
      </S.BottomCTA>
    </S.Wrapper>
  );
}

export default HireFormSection;
