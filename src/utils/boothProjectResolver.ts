import {
  listProjectsByCategory,
  type IeumProjectSummary,
} from '@/api/ieumApi';
import { BOOTHS, type Booth, type ExperienceCategoryId } from '@/data';

export interface ResolvedBoothProject {
  readonly booth: Booth;
  readonly categoryId: ExperienceCategoryId;
  readonly project: IeumProjectSummary;
}

const CATEGORY_IDS: readonly ExperienceCategoryId[] = [
  'ai',
  'human',
  'network',
  'personal',
  'creative',
  'global',
  'journey',
];

export function normalizeBoothSlot(value: string | null | undefined): string | null {
  if (!value) return null;
  const normalized = value.trim().toUpperCase();
  return /^[A-G][1-9]$/.test(normalized) ? normalized : null;
}

export function findBoothBySlot(value: string | null | undefined): Booth | null {
  const normalizedSlot = normalizeBoothSlot(value);
  if (!normalizedSlot) return null;
  return (
    BOOTHS.find(
      (booth) =>
        !booth.aux &&
        Boolean(booth.serviceName) &&
        normalizeBoothSlot(booth.title) === normalizedSlot,
    ) ?? null
  );
}

export async function resolveProjectForBooth(
  booth: Booth,
): Promise<ResolvedBoothProject | null> {
  const primaryProjects = await listProjectsByCategory(booth.categoryId);
  const primaryProject = findMatchingProject(primaryProjects, booth);
  if (primaryProject) {
    return {
      booth,
      categoryId: booth.categoryId,
      project: primaryProject,
    };
  }

  for (const categoryId of CATEGORY_IDS) {
    if (categoryId === booth.categoryId) continue;
    try {
      const projects = await listProjectsByCategory(categoryId);
      const project = findMatchingProject(projects, booth);
      if (project) {
        return { booth, categoryId, project };
      }
    } catch (error: unknown) {
      if (error instanceof Error) continue;
      throw error;
    }
  }

  return null;
}

function findMatchingProject(
  projects: readonly IeumProjectSummary[],
  booth: Booth,
): IeumProjectSummary | null {
  const boothSlot = normalizeBoothSlot(booth.title);
  const serviceName = normalizeServiceName(booth.serviceName);
  return (
    projects.find((project) => normalizeBoothSlot(project.boothSlot) === boothSlot) ??
    projects.find(
      (project) => normalizeServiceName(project.serviceName) === serviceName,
    ) ??
    null
  );
}

function normalizeServiceName(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}
