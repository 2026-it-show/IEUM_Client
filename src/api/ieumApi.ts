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
});

const contactSchema = z.object({
  id: z.string(),
});

const feedbackSchema = z.object({
  id: z.string(),
});

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
): Promise<void> {
  await requestData(`/projects/${projectId}/feedback`, feedbackSchema, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export async function createRecruiterContact(
  projectId: string,
  targetMemberUserId: string,
  card: BusinessCard | null,
): Promise<void> {
  const profile = await requestData('/visitor-profiles', visitorProfileSchema, {
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
  });

  await requestData(`/projects/${projectId}/contacts`, contactSchema, {
    method: 'POST',
    body: JSON.stringify({
      visitorProfileId: profile.id,
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

async function requestData<TSchema extends z.ZodType>(
  path: string,
  schema: TSchema,
  init?: RequestInit,
): Promise<z.infer<TSchema>> {
  const headers = new Headers(init?.headers);
  headers.set('Accept', 'application/json');
  headers.set('Content-Type', 'application/json');
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
