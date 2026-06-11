import {
  listProjectsByCategory,
  type IeumProjectSummary,
} from '@/api/ieumApi';

const IEUM_BOOTH_SLOT = 'C1';
const IEUM_SERVICE_NAMES = new Set(['이음', 'IEUM']);

let cachedProjectId: string | null = null;

export async function getIeumFeedbackProjectId(): Promise<string> {
  if (cachedProjectId) return cachedProjectId;

  const projects = await listProjectsByCategory('network');
  const project = projects.find(isIeumProject);
  if (!project) {
    throw new IeumFeedbackProjectNotFoundError();
  }
  cachedProjectId = project.id;
  return project.id;
}

function isIeumProject(project: IeumProjectSummary): boolean {
  return (
    project.boothSlot === IEUM_BOOTH_SLOT ||
    IEUM_SERVICE_NAMES.has(project.serviceName.trim())
  );
}

export class IeumFeedbackProjectNotFoundError extends Error {
  constructor() {
    super('IEUM feedback project was not found');
    this.name = 'IeumFeedbackProjectNotFoundError';
  }
}
