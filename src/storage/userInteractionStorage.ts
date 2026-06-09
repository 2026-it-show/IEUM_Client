const GUIDE_DISMISSED_KEY = 'ieum.onboardingGuide.dismissed';

type SubmissionKind = 'feedback' | 'contact';

function storage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch (error) {
    if (error instanceof Error) return null;
    throw error;
  }
}

function readFlag(key: string): boolean {
  const store = storage();
  if (!store) return false;
  try {
    return store.getItem(key) === '1';
  } catch (error) {
    if (error instanceof Error) return false;
    throw error;
  }
}

function writeFlag(key: string, value: boolean): void {
  const store = storage();
  if (!store) return;
  try {
    if (value) {
      store.setItem(key, '1');
      return;
    }
    store.removeItem(key);
  } catch (error) {
    if (error instanceof Error) return;
    throw error;
  }
}

function projectInterestKey(projectId: string): string {
  return `ieum.projectInterest.${projectId}`;
}

function projectSubmissionKey(kind: SubmissionKind, projectId: string): string {
  return `ieum.projectSubmission.${kind}.${projectId}`;
}

export function hasDismissedOnboardingGuide(): boolean {
  return readFlag(GUIDE_DISMISSED_KEY);
}

export function markOnboardingGuideDismissed(): void {
  writeFlag(GUIDE_DISMISSED_KEY, true);
}

export function loadProjectInterest(projectId: string): boolean {
  return readFlag(projectInterestKey(projectId));
}

export function saveProjectInterest(
  projectId: string,
  interested: boolean,
): void {
  writeFlag(projectInterestKey(projectId), interested);
}

export function hasSubmittedProjectAction(
  kind: SubmissionKind,
  projectId: string,
): boolean {
  return readFlag(projectSubmissionKey(kind, projectId));
}

export function markProjectActionSubmitted(
  kind: SubmissionKind,
  projectId: string,
): void {
  writeFlag(projectSubmissionKey(kind, projectId), true);
}
