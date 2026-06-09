import { useEffect, useState } from 'react';
import {
  BackHeader,
  PrototypeGuideOverlay,
  SuccessToast,
} from '@/components';
import { ServiceIntroSection } from '@/sections';
import {
  getProjectDetail,
  type IeumProjectDetail,
} from '@/api/ieumApi';
import { EXPERIENCE_CATEGORIES } from '@/data';
import * as S from './ServiceIntroPage.styled';

interface ServiceIntroPageProps {
  projectId: string | null;
  actionsEnabled: boolean;
  onBack: () => void;
  onHire: () => void;
  onFeedback: () => void;
  onProjectLoaded: (project: IeumProjectDetail) => void;
  showGuide: boolean;
  onGuideDismiss: () => void;
  feedbackSubmitted: boolean;
  contactSubmitted: boolean;
  toast?: string | null;
  onToastDismiss?: () => void;
}

type LoadStatus = 'loading' | 'ready' | 'error';

interface ProjectLoadState {
  projectId: string;
  project: IeumProjectDetail | null;
  status: LoadStatus;
}

function ServiceIntroPage({
  projectId,
  actionsEnabled,
  onBack,
  onHire,
  onFeedback,
  onProjectLoaded,
  showGuide,
  onGuideDismiss,
  feedbackSubmitted,
  contactSubmitted,
  toast,
  onToastDismiss,
}: ServiceIntroPageProps) {
  const [loadState, setLoadState] = useState<ProjectLoadState | null>(null);
  const project =
    loadState?.projectId === projectId ? loadState.project : null;
  const status: LoadStatus = !projectId
    ? 'error'
    : loadState?.projectId === projectId
      ? loadState.status
      : 'loading';
  const category = EXPERIENCE_CATEGORIES.find(
    (item) => item.id === project?.experienceCategory,
  );
  const bandText = project
    ? `${project.experienceCategory?.toUpperCase() ?? 'PROJECT'} EXPERIENCE`
    : undefined;

  useEffect(() => {
    if (!projectId) {
      return;
    }
    let active = true;
    getProjectDetail(projectId)
      .then((detail) => {
        if (!active) return;
        setLoadState({ projectId, project: detail, status: 'ready' });
        onProjectLoaded(detail);
      })
      .catch(() => {
        if (!active) return;
        setLoadState({ projectId, project: null, status: 'error' });
      });
    return () => {
      active = false;
    };
  }, [onProjectLoaded, projectId]);

  return (
    <S.Page>
      <BackHeader
        title={project?.serviceName ?? '프로젝트'}
        onBack={onBack}
        compact
        bandText={bandText}
        bandColor={category?.color}
      />
      {project ? (
        <ServiceIntroSection
          project={project}
          actionsEnabled={actionsEnabled}
          onFeedback={onFeedback}
          onHire={onHire}
          feedbackSubmitted={feedbackSubmitted}
          contactSubmitted={contactSubmitted}
        />
      ) : (
        status === 'loading' ? (
          <ServiceIntroSkeleton />
        ) : (
          <S.StatusText>프로젝트 정보를 불러오지 못했습니다</S.StatusText>
        )
      )}
      {actionsEnabled && showGuide && !toast && (
        <PrototypeGuideOverlay
          message={guideMessage(project)}
          onDismiss={onGuideDismiss}
        />
      )}
      {toast && onToastDismiss && (
        <SuccessToast message={toast} onDismiss={onToastDismiss} />
      )}
    </S.Page>
  );
}

function ServiceIntroSkeleton() {
  return (
    <S.SkeletonScroll aria-hidden="true">
      <S.SkeletonHero />
      <S.SkeletonTitleRow>
        <S.SkeletonTitleBlock>
          <S.SkeletonTitle />
          <S.SkeletonTextLine $width="86%" />
          <S.SkeletonTextLine $width="72%" />
        </S.SkeletonTitleBlock>
        <S.SkeletonHeart />
      </S.SkeletonTitleRow>
      <S.SkeletonTags>
        {['64px', '96px', '84px', '120px'].map((width) => (
          <S.SkeletonTag key={width} $width={width} />
        ))}
      </S.SkeletonTags>
      <S.SkeletonDetailList>
        {['92%', '78%', '86%'].map((width) => (
          <S.SkeletonDetailBlock key={width}>
            <S.SkeletonSectionTitle />
            <S.SkeletonTextLine $width={width} />
            <S.SkeletonTextLine $width="66%" />
          </S.SkeletonDetailBlock>
        ))}
      </S.SkeletonDetailList>
    </S.SkeletonScroll>
  );
}

function guideMessage(project: IeumProjectDetail | null): string {
  if (project?.acceptsFeedback === false) {
    return '프로젝트에 대한\n채용 의사를 밝힐 수 있습니다';
  }
  return '프로젝트에 대한 피드백을 남기거나\n채용 의사를 밝힐 수 있습니다';
}

export default ServiceIntroPage;
