import { useState } from 'react';
import {
  markProjectInterest,
  type IeumProjectDetail,
} from '@/api/ieumApi';
import {
  loadProjectInterest,
  saveProjectInterest,
} from '@/storage/userInteractionStorage';
import { toOptimizedImagePath } from '@/utils/imageAssets';
import * as S from './ServiceIntroSection.styled';

interface ServiceIntroSectionProps {
  project: IeumProjectDetail;
  actionsEnabled: boolean;
  onFeedback: () => void;
  onHire: () => void;
  feedbackSubmitted: boolean;
  contactSubmitted: boolean;
}

function ServiceIntroSection({
  project,
  actionsEnabled,
  onFeedback,
  onHire,
  feedbackSubmitted,
  contactSubmitted,
}: ServiceIntroSectionProps) {
  const [interestState, setInterestState] = useState(() => ({
    projectId: project.id,
    interested: loadProjectInterest(project.id),
    saving: false,
  }));
  const interested =
    interestState.projectId === project.id
      ? interestState.interested
      : loadProjectInterest(project.id);
  const saving =
    interestState.projectId === project.id ? interestState.saving : false;
  const thumbnail = toOptimizedImagePath(project.thumbnailUrl ?? project.thumbnailPath);

  const handleInterestToggle = () => {
    if (interested || saving) return;
    saveProjectInterest(project.id, true);
    setInterestState({ projectId: project.id, interested: true, saving: true });
    void markProjectInterest(project.id).finally(() => {
      setInterestState({ projectId: project.id, interested: true, saving: false });
    });
  };

  return (
    <S.Wrapper>
      <S.ScrollArea $hasCta={actionsEnabled}>
        <S.Card>
          <img src={thumbnail} alt={`${project.serviceName} 서비스 미리보기`} />
        </S.Card>

        <S.TitleRow>
          <S.TitleText>
            <S.ServiceName>{project.serviceName}</S.ServiceName>
          </S.TitleText>
          <S.LikeButton
            type="button"
            aria-label={interested ? '관심 표시 완료' : '관심 프로젝트'}
            aria-pressed={interested}
            $active={interested}
            disabled={saving}
            onClick={handleInterestToggle}
          >
            <S.HeartIcon
              viewBox="0 0 36 36"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M29.25 18.858L18 30L6.74996 18.858C6.00792 18.1359 5.42343 17.268 5.03329 16.3089C4.64314 15.3499 4.45581 14.3204 4.48307 13.2854C4.51033 12.2504 4.75161 11.2322 5.1917 10.295C5.63179 9.3578 6.26117 8.52187 7.04019 7.83986C7.81922 7.15785 8.73102 6.64452 9.71818 6.33221C10.7053 6.0199 11.7465 5.91537 12.776 6.02519C13.8056 6.13502 14.8012 6.45683 15.7003 6.97035C16.5993 7.48387 17.3823 8.17799 18 9.00899C18.6203 8.18402 19.4042 7.49597 20.3026 6.9879C21.2011 6.47982 22.1947 6.16266 23.2214 6.05627C24.248 5.94988 25.2856 6.05654 26.2691 6.36958C27.2527 6.68262 28.161 7.1953 28.9373 7.87554C29.7136 8.55577 30.3411 9.38892 30.7806 10.3228C31.2201 11.2567 31.4621 12.2713 31.4914 13.3031C31.5208 14.3348 31.3369 15.3615 30.9512 16.3189C30.5655 17.2763 29.9863 18.1437 29.25 18.867" />
            </S.HeartIcon>
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
          {project.acceptsFeedback ? (
            <S.FeedbackButton
              type="button"
              onClick={onFeedback}
              disabled={feedbackSubmitted}
            >
              {feedbackSubmitted ? '피드백 완료' : '피드백'}
            </S.FeedbackButton>
          ) : null}
          <S.HireButton
            type="button"
            onClick={onHire}
            disabled={contactSubmitted}
          >
            {contactSubmitted ? '채용 완료' : '채용'}
          </S.HireButton>
        </S.BottomCTA>
      ) : null}
    </S.Wrapper>
  );
}

export default ServiceIntroSection;
