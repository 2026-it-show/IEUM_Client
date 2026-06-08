import { BackHeader } from '@/components';
import { CategoryListSection } from '@/sections';
import {
  CATEGORY_PROJECTS,
  EXPERIENCE_CATEGORIES,
  type ExperienceCategoryId,
  type ProjectListItem,
} from '@/data';
import * as S from './CategoryListPage.styled';

interface CategoryListPageProps {
  categoryId: ExperienceCategoryId;
  onBack: () => void;
  onPickProject: (project: ProjectListItem) => void;
}

function CategoryListPage({
  categoryId,
  onBack,
  onPickProject,
}: CategoryListPageProps) {
  const category = EXPERIENCE_CATEGORIES.find((c) => c.id === categoryId);
  const projects = CATEGORY_PROJECTS[categoryId] ?? [];
  const title = category ? category.title.toUpperCase() : '';

  return (
    <S.Page>
      <BackHeader title={title} onBack={onBack} />
      <CategoryListSection projects={projects} onPickProject={onPickProject} />
    </S.Page>
  );
}

export default CategoryListPage;
