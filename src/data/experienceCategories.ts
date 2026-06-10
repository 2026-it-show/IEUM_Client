import { BOOTHS } from './booths';
import type {
  ExperienceCategory,
  ExperienceCategoryId,
  ProjectListItem,
} from './types';
import { FALLBACK_PROJECT_THUMBNAIL } from '@/utils/imageAssets';

export const EXPERIENCE_CATEGORIES: ExperienceCategory[] = [
  { id: 'ai', title: 'AI Experience', color: '#2B92D0', x: 0.1998, y: 0.2673 },
  { id: 'human', title: 'Human Experience', color: '#F399BE', x: 0.4431, y: 0.3092 },
  { id: 'network', title: 'Network Experience', color: '#F4827E', x: 0.6589, y: 0.2322 },
  { id: 'personal', title: 'Personal Experience', color: '#23B575', x: 0.8828, y: 0.217 },
  { id: 'creative', title: 'Creative Experience', color: '#F9C96B', x: 0.8017, y: 0.5356 },
  { id: 'global', title: 'Global Experience', color: '#D88E70', x: 0.1031, y: 0.6258 },
  { id: 'journey', title: 'Journey Experience', color: '#C797C5', x: 0.8471, y: 0.8401 },
];

// Booth-IDs that should be grouped under "DE" (design exhibits). Everything
// else falls into the default "SW" group.
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

// Derive category → project list from the booth data so a single source of
// truth keeps booth tile labels and the list page in sync.
function buildCategoryProjects(): Record<
  ExperienceCategoryId,
  ProjectListItem[]
> {
  const acc: Record<ExperienceCategoryId, ProjectListItem[]> = {
    global: [],
    ai: [],
    human: [],
    network: [],
    personal: [],
    creative: [],
    journey: [],
  };

  for (const booth of BOOTHS) {
    if (booth.aux || !booth.serviceName) continue;
    acc[booth.categoryId].push({
      id: booth.id,
      name: booth.serviceName,
      thumbnail: FALLBACK_PROJECT_THUMBNAIL,
      group: DE_BOOTH_IDS.has(booth.id) ? 'DE' : 'SW',
    });
  }

  return acc;
}

export const CATEGORY_PROJECTS: Record<
  ExperienceCategoryId,
  ProjectListItem[]
> = buildCategoryProjects();
