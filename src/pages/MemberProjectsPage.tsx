import { useEffect, useState } from 'react';
import { BackHeader } from '@/components';
import {
  listProjectsByMember,
  type IeumProjectSummary,
} from '@/api/ieumApi';
import { toOptimizedImagePath } from '@/utils/imageAssets';
import * as S from './MemberProjectsPage.styled';

interface MemberProjectsPageProps {
  memberId: string;
  memberName: string;
  excludeProjectId?: string | null;
  onBack: () => void;
  onPickProject: (project: IeumProjectSummary) => void;
}

type LoadStatus = 'loading' | 'ready' | 'error';

interface ProjectsLoadState {
  memberId: string;
  projects: IeumProjectSummary[];
  status: LoadStatus;
}

function MemberProjectsPage({
  memberId,
  memberName,
  excludeProjectId,
  onBack,
  onPickProject,
}: MemberProjectsPageProps) {
  const [loadState, setLoadState] = useState<ProjectsLoadState | null>(null);
  const status: LoadStatus =
    loadState?.memberId === memberId ? loadState.status : 'loading';
  const projects =
    loadState?.memberId === memberId ? loadState.projects : [];

  useEffect(() => {
    let active = true;
    listProjectsByMember(memberId)
      .then((items) => {
        if (!active) return;
        setLoadState({ memberId, projects: items, status: 'ready' });
      })
      .catch(() => {
        if (!active) return;
        setLoadState({ memberId, projects: [], status: 'error' });
      });
    return () => {
      active = false;
    };
  }, [memberId]);

  const visibleProjects = projects.filter(
    (project) => project.id !== excludeProjectId,
  );

  return (
    <S.Page>
      <BackHeader title={memberName} onBack={onBack} />
      {status === 'loading' ? (
        <S.Grid aria-hidden="true">
          {[0, 1].map((key) => (
            <S.SkeletonCard key={key}>
              <S.SkeletonThumbnail />
              <S.SkeletonLabel />
            </S.SkeletonCard>
          ))}
        </S.Grid>
      ) : null}
      {status === 'error' ? (
        <S.StatusText>다른 작품을 불러오지 못했습니다</S.StatusText>
      ) : null}
      {status === 'ready' ? (
        visibleProjects.length === 0 ? (
          <S.StatusText>등록된 다른 작품이 없습니다</S.StatusText>
        ) : (
          <S.Grid>
            {visibleProjects.map((project) => (
              <S.ProjectCard
                key={project.id}
                type="button"
                onClick={() => onPickProject(project)}
              >
                <S.Thumbnail
                  src={toOptimizedImagePath(
                    project.thumbnailUrl ?? project.thumbnailPath,
                  )}
                  alt={`${project.serviceName} 미리보기`}
                  loading="lazy"
                />
                <S.ProjectLabel>
                  {projectLabel(project)}
                </S.ProjectLabel>
              </S.ProjectCard>
            ))}
          </S.Grid>
        )
      ) : null}
    </S.Page>
  );
}

function projectLabel(project: IeumProjectSummary): string {
  return project.boothSlot
    ? `${project.boothSlot}-${project.serviceName}`
    : project.serviceName;
}

export default MemberProjectsPage;
