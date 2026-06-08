import type { IeumProjectDetail } from '@/api/ieumApi';
import { EXPERIENCE_CATEGORIES } from '@/data';
import * as S from './ServiceIntroSection.styled';

interface ServiceIntroSectionProps {
  project: IeumProjectDetail;
  actionsEnabled: boolean;
  onFeedback: () => void;
  onHire: () => void;
}

function ServiceIntroSection({
  project,
  actionsEnabled,
  onFeedback,
  onHire,
}: ServiceIntroSectionProps) {
  const thumbnail =
    project.thumbnailUrl ?? project.thumbnailPath ?? '/assets/image/growvy.png';
  const banner = `${project.experienceCategory?.toUpperCase() ?? 'PROJECT'} EXPERIENCE`;
  const bannerColor =
    EXPERIENCE_CATEGORIES.find(
      (category) => category.id === project.experienceCategory,
    )?.color ?? '#D88E70';

  return (
    <S.Wrapper>
      <S.ScrollArea $hasCta={actionsEnabled}>
        <S.Banner $background={bannerColor}>{banner}</S.Banner>

        <S.Card>
          <img src={thumbnail} alt={`${project.serviceName} 서비스 미리보기`} />
        </S.Card>

        <S.TitleRow>
          <S.ServiceName>{project.serviceName}</S.ServiceName>
          <S.LikeButton type="button" aria-label="좋아요">
            <img src="/assets/icons/like_icon.svg" alt="" aria-hidden="true" />
          </S.LikeButton>
        </S.TitleRow>

        <S.Description>
          {project.description}
        </S.Description>

        <S.TagList>
          {project.stackGroups.flatMap((group) =>
            group.items.map((item) => (
              <S.Tag
                key={`${group.category}-${item}`}
                $bg={`${group.color}33`}
                $color={group.color}
              >
                {item}
              </S.Tag>
            )),
          )}
        </S.TagList>

        <S.DetailList>
          {project.featureDescriptions.map((feature) => (
            <S.DetailBlock key={feature.title}>
              <S.DetailTitle>{feature.title}</S.DetailTitle>
              <S.FeatureText>{feature.description}</S.FeatureText>
            </S.DetailBlock>
          ))}
        </S.DetailList>
      </S.ScrollArea>

      {actionsEnabled ? (
        <S.BottomCTA>
          <S.FeedbackButton type="button" onClick={onFeedback}>
            피드백
          </S.FeedbackButton>
          <S.HireButton type="button" onClick={onHire}>
            채용
          </S.HireButton>
        </S.BottomCTA>
      ) : null}
    </S.Wrapper>
  );
}

export default ServiceIntroSection;
