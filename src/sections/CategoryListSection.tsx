import { useMemo } from 'react';
import type { ProjectListItem } from '@/data';
import * as S from './CategoryListSection.styled';

interface CategoryListSectionProps {
  projects: ProjectListItem[];
  isLoading?: boolean;
  message?: string;
  onPickProject: (project: ProjectListItem) => void;
}

function CategoryListSection({
  projects,
  isLoading = false,
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
      {isLoading ? <ProjectListSkeleton /> : null}
      {!isLoading && message ? <S.Message>{message}</S.Message> : null}
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
                <S.CardInfo>
                  {project.boothSlot ? (
                    <S.BoothCode>{project.boothSlot}</S.BoothCode>
                  ) : null}
                  <S.CardName>{project.name}</S.CardName>
                </S.CardInfo>
              </S.Card>
            ))}
          </S.Grid>
        </div>
      ))}
    </S.Wrapper>
  );
}

function ProjectListSkeleton() {
  return (
    <>
      <S.SkeletonGroupLabel />
      <S.Grid aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => (
          <S.SkeletonCard key={index}>
            <S.SkeletonThumbnail />
            <S.SkeletonInfo>
              <S.SkeletonBooth />
              <S.SkeletonName />
            </S.SkeletonInfo>
          </S.SkeletonCard>
        ))}
      </S.Grid>
    </>
  );
}

export default CategoryListSection;
