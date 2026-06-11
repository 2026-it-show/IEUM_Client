const GUIDE_DISMISSED_KEY = 'ieum.onboardingGuide.dismissed';
const INITIAL_ONBOARDING_COMPLETED_KEY = 'ieum.initialOnboarding.completed';
const INITIAL_ONBOARDING_PURPOSE_KEY = 'ieum.initialOnboarding.purpose';
const MAP_TUTORIAL_DISMISSED_KEY = 'ieum.mapTutorial.dismissed';

export type VisitorPurpose = 'employment' | 'viewing';
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

function memberContactKey(projectId: string, memberId: string): string {
  return `ieum.memberContact.${projectId}.${memberId}`;
}

export function hasDismissedOnboardingGuide(): boolean {
  return readFlag(GUIDE_DISMISSED_KEY);
}

export function markOnboardingGuideDismissed(): void {
  writeFlag(GUIDE_DISMISSED_KEY, true);
}

export function hasCompletedInitialOnboarding(): boolean {
  return readFlag(INITIAL_ONBOARDING_COMPLETED_KEY);
}

export function markInitialOnboardingCompleted(): void {
  writeFlag(INITIAL_ONBOARDING_COMPLETED_KEY, true);
}

export function saveVisitorPurpose(purpose: VisitorPurpose): void {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(INITIAL_ONBOARDING_PURPOSE_KEY, purpose);
  } catch (error) {
    if (error instanceof Error) return;
    throw error;
  }
}

export function loadVisitorPurpose(): VisitorPurpose | null {
  const store = storage();
  if (!store) return null;
  try {
    const value = store.getItem(INITIAL_ONBOARDING_PURPOSE_KEY);
    if (value === 'employment' || value === 'viewing') return value;
    return null;
  } catch (error) {
    if (error instanceof Error) return null;
    throw error;
  }
}

export function hasRecruiterPurpose(): boolean {
  return loadVisitorPurpose() === 'employment';
}

export function hasDismissedMapTutorial(): boolean {
  return readFlag(MAP_TUTORIAL_DISMISSED_KEY);
}

export function markMapTutorialDismissed(): void {
  writeFlag(MAP_TUTORIAL_DISMISSED_KEY, true);
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

export function hasSubmittedMemberContact(
  projectId: string,
  memberId: string,
): boolean {
  return readFlag(memberContactKey(projectId, memberId));
}

export function markMemberContactSubmitted(
  projectId: string,
  memberId: string,
): void {
  writeFlag(memberContactKey(projectId, memberId), true);
}
