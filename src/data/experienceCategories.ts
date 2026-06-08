import { BOOTHS } from './booths';
import type {
  ExperienceCategory,
  ExperienceCategoryId,
  ProjectListItem,
} from './types';

export const EXPERIENCE_CATEGORIES: ExperienceCategory[] = [
  // Pill positions match the reference floor-plan image (763x1024).
  { id: 'global', title: 'Global Experience', color: '#D88E70', x: 0.131, y: 0.752 },
  { id: 'ai', title: 'AI Experience', color: '#2B92D0', x: 0.164, y: 0.455 },
  { id: 'human', title: 'Human Experience', color: '#F399BE', x: 0.389, y: 0.455 },
  { id: 'network', title: 'Network Experience', color: '#F4827E', x: 0.585, y: 0.422 },
  { id: 'personal', title: 'Personal Experience', color: '#23B575', x: 0.754, y: 0.422 },
  { id: 'creative', title: 'Creative Experience', color: '#F9C96B', x: 0.555, y: 0.530 },
  { id: 'journey', title: 'Journey Experience', color: '#B68FCF', x: 0.555, y: 0.770 },
];

const GROWY_THUMBNAIL = '/assets/image/growvy.png';

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
      thumbnail: GROWY_THUMBNAIL,
      group: DE_BOOTH_IDS.has(booth.id) ? 'DE' : 'SW',
    });
  }

  return acc;
}

export const CATEGORY_PROJECTS: Record<
  ExperienceCategoryId,
  ProjectListItem[]
> = buildCategoryProjects();
