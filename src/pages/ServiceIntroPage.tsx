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
      <BackHeader title={project?.serviceName ?? '프로젝트'} onBack={onBack} />
      {project ? (
        <ServiceIntroSection
          project={project}
          actionsEnabled={actionsEnabled}
          onFeedback={onFeedback}
          onHire={onHire}
        />
      ) : (
        <S.StatusText>
          {status === 'loading'
            ? '프로젝트를 불러오는 중입니다'
            : '프로젝트 정보를 불러오지 못했습니다'}
        </S.StatusText>
      )}
      {actionsEnabled && showGuide && !toast && (
        <PrototypeGuideOverlay onDismiss={onGuideDismiss} />
      )}
      {toast && onToastDismiss && (
        <SuccessToast message={toast} onDismiss={onToastDismiss} />
      )}
    </S.Page>
  );
}

export default ServiceIntroPage;
