import { z } from 'zod';
import { API_BASE_URL } from '@/data';
import type { BusinessCard } from '@/data';
import { buildApiUrl } from './apiUrl';

const stackGroupSchema = z.object({
  category: z.string(),
  color: z.string(),
  items: z.array(z.string()),
});

const featureDescriptionSchema = z.object({
  title: z.string(),
  description: z.string(),
});

const projectSummarySchema = z.object({
  id: z.string(),
  serviceName: z.string(),
  teamName: z.string(),
  description: z.string().nullable(),
  thumbnailUrl: z.string().nullable(),
  thumbnailPath: z.string().nullable(),
  experienceCategory: z.string().nullable(),
  boothSlot: z.string().nullable(),
  developmentStacks: z.array(z.string()),
  designStacks: z.array(z.string()),
  stackGroups: z.array(stackGroupSchema),
  featureDescriptions: z.array(featureDescriptionSchema),
  acceptsFeedback: z.boolean().default(true),
  isPublished: z.boolean(),
  feedbackCount: z.number(),
  contactCount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const projectMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  displayOrder: z.number(),
  roles: z.array(z.string()),
});

const projectDetailSchema = projectSummarySchema.extend({
  members: z.array(projectMemberSchema),
});

const projectListSchema = z.object({
  items: z.array(projectSummarySchema),
  nextCursor: z.string().nullable(),
});

const visitorProfileSchema = z.object({
  id: z.string(),
  businessCardFileId: z.string().nullable().optional(),
  businessCardBackFileId: z.string().nullable().optional(),
  businessCardRegistered: z.boolean().optional(),
  ocrRawText: z.string().nullable().optional(),
  ocrName: z.string().nullable().optional(),
  ocrOrganization: z.string().nullable().optional(),
  ocrPosition: z.string().nullable().optional(),
  ocrEmail: z.string().nullable().optional(),
  ocrPhone: z.string().nullable().optional(),
});

const contactSchema = z.object({
  id: z.string(),
});

const feedbackSchema = z.object({
  id: z.string(),
  status: z.enum(['public', 'blocked', 'deleted']),
  moderationReason: z.string().nullable().optional(),
});

export type IeumFeedback = z.infer<typeof feedbackSchema>;

const projectInterestSchema = z.object({
  projectId: z.string(),
  interestCount: z.number(),
  alreadyInterested: z.boolean(),
});

const apiResponseSchema = z.object({
  statusCode: z.number(),
  data: z.unknown(),
  message: z.array(z.string()),
  timestamp: z.string(),
});

export type IeumProjectSummary = z.infer<typeof projectSummarySchema>;
export type IeumProjectDetail = z.infer<typeof projectDetailSchema>;
export type IeumProjectMember = z.infer<typeof projectMemberSchema>;
export type IeumProjectInterest = z.infer<typeof projectInterestSchema>;
export type IeumVisitorProfile = z.infer<typeof visitorProfileSchema>;

interface ProjectListCacheEntry {
  readonly expiresAt: number;
  readonly promise: Promise<IeumProjectSummary[]>;
}

const FEEDBACK_DISABLED_BOOTH_SLOTS = new Set([
  'A6',
  'B3',
  'C5',
  'D5',
  'D6',
  'E2',
]);
const PROJECT_LIST_CACHE_TTL_MS = 30_000;
const OCR_POLL_INTERVAL_MS = 1_000;
const OCR_POLL_TIMEOUT_MS = 30_000;
const projectListCache = new Map<string, ProjectListCacheEntry>();

export async function listProjectsByCategory(
  category: string,
): Promise<IeumProjectSummary[]> {
  const now = Date.now();
  const cached = projectListCache.get(category);
  if (cached && cached.expiresAt > now) {
    return cached.promise;
  }
  const promise = requestData(
    `/projects?category=${encodeURIComponent(category)}&limit=80&includeCounts=false`,
    projectListSchema,
  )
    .then((data) => data.items.map(applyFeedbackPolicy))
    .catch((error: unknown) => {
      projectListCache.delete(category);
      throw error;
    });
  projectListCache.set(category, {
    expiresAt: now + PROJECT_LIST_CACHE_TTL_MS,
    promise,
  });
  return promise;
}

export async function listProjectsByMember(
  memberUserId: string,
): Promise<IeumProjectSummary[]> {
  try {
    const data = await requestData(
      `/projects?memberUserId=${encodeURIComponent(memberUserId)}&limit=80&includeCounts=false`,
      projectListSchema,
    );
    return data.items.map(applyFeedbackPolicy);
  } catch (error) {
    // 구버전 서버는 memberUserId 필터를 모르고 400을 반환한다 — 상세 조회로 폴백
    if (error instanceof Error && error.message.includes('memberUserId')) {
      return listProjectsByMemberFallback(memberUserId);
    }
    throw error;
  }
}

async function listProjectsByMemberFallback(
  memberUserId: string,
): Promise<IeumProjectSummary[]> {
  const data = await requestData(
    '/projects?limit=80&includeCounts=false',
    projectListSchema,
  );
  const memberships = await mapWithConcurrency(data.items, 8, async (summary) => {
    try {
      const detail = await getProjectDetail(summary.id);
      return detail.members.some((member) => member.id === memberUserId);
    } catch {
      return false;
    }
  });
  return data.items
    .filter((_, index) => memberships[index])
    .map(applyFeedbackPolicy);
}

async function mapWithConcurrency<TInput, TOutput>(
  items: readonly TInput[],
  concurrency: number,
  task: (item: TInput) => Promise<TOutput>,
): Promise<TOutput[]> {
  const results: TOutput[] = new Array<TOutput>(items.length);
  let nextIndex = 0;
  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    async () => {
      while (nextIndex < items.length) {
        const index = nextIndex;
        nextIndex += 1;
        results[index] = await task(items[index]);
      }
    },
  );
  await Promise.all(workers);
  return results;
}

export async function getProjectDetail(
  projectId: string,
): Promise<IeumProjectDetail> {
  const project = await requestData(`/projects/${projectId}`, projectDetailSchema);
  return applyFeedbackPolicy(project);
}

export async function markProjectInterest(
  projectId: string,
): Promise<IeumProjectInterest> {
  return requestData(`/projects/${projectId}/interests`, projectInterestSchema, {
    method: 'POST',
  });
}

export async function createFeedback(
  projectId: string,
  content: string,
): Promise<IeumFeedback> {
  return requestData(`/projects/${projectId}/feedback`, feedbackSchema, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export async function createRecruiterContact(
  projectId: string,
  targetMemberUserId: string,
  card: BusinessCard | null,
  visitorProfileId?: string | null,
): Promise<void> {
  const profileId = visitorProfileId ?? (await requestData('/visitor-profiles', visitorProfileSchema, {
    method: 'POST',
    body: JSON.stringify({
      ageGroup: 'adult',
      visitorType: 'recruiter',
      ocrName: card?.name || '채용 담당자',
      ocrOrganization: card?.companyName || undefined,
      ocrPosition: card?.position || undefined,
      ocrEmail: card?.email || undefined,
      ocrPhone: card?.phone || undefined,
    }),
  })).id;

  await requestData(`/projects/${projectId}/contacts`, contactSchema, {
    method: 'POST',
    body: JSON.stringify({
      visitorProfileId: profileId,
      targetMemberUserId,
      name: card?.name || '채용 담당자',
      organization: card?.companyName || undefined,
      position: card?.position || undefined,
      email: card?.email || undefined,
      phone: card?.phone || undefined,
      memo: card?.companyAddress ? `회사 위치: ${card.companyAddress}` : undefined,
    }),
  });
}

export async function createRecruiterVisitorProfileFromBusinessCards(
  frontFile: File,
  backFile: File,
): Promise<IeumVisitorProfile> {
  const body = new FormData();
  body.set('ageGroup', 'adult');
  body.set('visitorType', 'recruiter');
  body.set('businessCardFront', frontFile);
  body.set('businessCardBack', backFile);
  const profile = await requestData('/visitor-profiles', visitorProfileSchema, {
    method: 'POST',
    body,
  });
  return waitForVisitorProfileOcr(profile);
}

export function getVisitorProfile(visitorProfileId: string): Promise<IeumVisitorProfile> {
  return requestData(`/visitor-profiles/${encodeURIComponent(visitorProfileId)}`, visitorProfileSchema);
}

async function waitForVisitorProfileOcr(profile: IeumVisitorProfile): Promise<IeumVisitorProfile> {
  const startedAt = Date.now();
  while (Date.now() - startedAt < OCR_POLL_TIMEOUT_MS) {
    const latest = await getVisitorProfile(profile.id);
    if (hasOcrResult(latest)) return latest;
    await delay(OCR_POLL_INTERVAL_MS);
  }
  return profile;
}

function hasOcrResult(profile: IeumVisitorProfile): boolean {
  return Boolean(
    profile.ocrRawText ||
      profile.ocrName ||
      profile.ocrOrganization ||
      profile.ocrPosition ||
      profile.ocrEmail ||
      profile.ocrPhone,
  );
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

async function requestData<TSchema extends z.ZodType>(
  path: string,
  schema: TSchema,
  init?: RequestInit,
): Promise<z.infer<TSchema>> {
  const headers = new Headers(init?.headers);
  headers.set('Accept', 'application/json');
  if (!(init?.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  const response = await fetch(buildApiUrl(API_BASE_URL, path), {
    ...init,
    headers,
  });
  const payload: unknown = await response.json();
  if (!response.ok) {
    throw new Error(readErrorMessage(payload) ?? `API request failed: ${response.status}`);
  }
  const wrapped = apiResponseSchema.parse(payload);
  return schema.parse(wrapped.data);
}

function readErrorMessage(payload: unknown): string | null {
  const parsed = z.object({ message: z.union([z.string(), z.array(z.string())]).optional() }).safeParse(payload);
  if (!parsed.success || !parsed.data.message) return null;
  return Array.isArray(parsed.data.message)
    ? parsed.data.message.join('\n')
    : parsed.data.message;
}

function applyFeedbackPolicy<TProject extends IeumProjectSummary>(
  project: TProject,
): TProject {
  if (
    project.boothSlot &&
    FEEDBACK_DISABLED_BOOTH_SLOTS.has(project.boothSlot)
  ) {
    return { ...project, acceptsFeedback: false };
  }
  return project;
}
