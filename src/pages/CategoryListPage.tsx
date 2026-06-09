import { useEffect, useMemo, useState } from 'react';
import { BackHeader } from '@/components';
import { CategoryListSection } from '@/sections';
import {
  EXPERIENCE_CATEGORIES,
  type ExperienceCategoryId,
  type ProjectListItem,
} from '@/data';
import {
  listProjectsByCategory,
  type IeumProjectSummary,
} from '@/api/ieumApi';
import * as S from './CategoryListPage.styled';

interface CategoryListPageProps {
  categoryId: ExperienceCategoryId;
  onBack: () => void;
  onPickProject: (project: ProjectListItem) => void;
}

type LoadStatus = 'loading' | 'ready' | 'error';

interface ProjectLoadState {
  categoryId: ExperienceCategoryId;
  projects: IeumProjectSummary[];
  status: LoadStatus;
}

function CategoryListPage({
  categoryId,
  onBack,
  onPickProject,
}: CategoryListPageProps) {
  const [loadState, setLoadState] = useState<ProjectLoadState>({
    categoryId,
    projects: [],
    status: 'loading',
  });
  const category = EXPERIENCE_CATEGORIES.find((c) => c.id === categoryId);
  const title = category ? category.title.toUpperCase() : '';
  const status: LoadStatus =
    loadState.categoryId === categoryId ? loadState.status : 'loading';
  const listItems = useMemo(() => {
    const projects =
      loadState.categoryId === categoryId ? loadState.projects : [];
    return projects.map(toProjectListItem);
  }, [categoryId, loadState]);
  const message = resolveMessage(status, listItems.length);

  useEffect(() => {
    let active = true;
    listProjectsByCategory(categoryId)
      .then((items) => {
        if (!active) return;
        setLoadState({ categoryId, projects: items, status: 'ready' });
      })
      .catch(() => {
        if (!active) return;
        setLoadState({ categoryId, projects: [], status: 'error' });
      });
    return () => {
      active = false;
    };
  }, [categoryId]);

  return (
    <S.Page>
      <BackHeader title={title} onBack={onBack} />
      <CategoryListSection
        projects={listItems}
        isLoading={status === 'loading'}
        message={message}
        onPickProject={onPickProject}
      />
    </S.Page>
  );
}

const DE_BOOTH_IDS = new Set<string>([
  'E1',
  'E2',
  'E3',
  'E4',
  'E5',
  'E6',
  'F4',
  'F5',
  'F6',
]);

function toProjectListItem(project: IeumProjectSummary): ProjectListItem {
  return {
    id: project.id,
    name: project.serviceName,
    thumbnail:
      project.thumbnailUrl ?? project.thumbnailPath ?? '/assets/image/growvy.png',
    group: project.boothSlot && DE_BOOTH_IDS.has(project.boothSlot) ? 'DE' : 'SW',
    boothSlot: project.boothSlot ?? undefined,
  };
}

function resolveMessage(
  status: 'loading' | 'ready' | 'error',
  projectCount: number,
): string | undefined {
  if (status === 'loading') return '프로젝트를 불러오는 중입니다';
  if (status === 'error') return '프로젝트 목록을 불러오지 못했습니다';
  if (projectCount === 0) return '등록된 프로젝트가 없습니다';
  return undefined;
}

export default CategoryListPage;
