import { useMemo } from 'react';
import type { ProjectListItem } from '@/data';
import * as S from './CategoryListSection.styled';

interface CategoryListSectionProps {
  projects: ProjectListItem[];
  message?: string;
  onPickProject: (project: ProjectListItem) => void;
}

function CategoryListSection({
  projects,
  message,
  onPickProject,
}: CategoryListSectionProps) {
  const grouped = useMemo(() => {
    const order: Array<ProjectListItem['group']> = ['SW', 'DE'];
    return order
      .map((group) => ({
        group,
        items: projects.filter((p) => p.group === group),
      }))
      .filter(({ items }) => items.length > 0);
  }, [projects]);

  return (
    <S.Wrapper>
      {message ? <S.Message>{message}</S.Message> : null}
      {grouped.map(({ group, items }) => (
        <div key={group}>
          <S.GroupLabel>{group}</S.GroupLabel>
          <S.Grid>
            {items.map((project) => (
              <S.Card
                key={project.id}
                type="button"
                onClick={() => onPickProject(project)}
              >
                <S.Thumbnail>
                  <img src={project.thumbnail} alt={project.name} />
                </S.Thumbnail>
                <S.CardName>{project.name}</S.CardName>
              </S.Card>
            ))}
          </S.Grid>
        </div>
      ))}
    </S.Wrapper>
  );
}

export default CategoryListSection;
