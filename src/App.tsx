import { useCallback, useEffect, useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { GlobalStyle, theme } from '@/styles';
import {
  BusinessCardPage,
  CategoryListPage,
  FeedbackPage,
  HirePage,
  MapPage,
  MemberProjectsPage,
  QrScanPage,
  ServiceIntroPage,
} from '@/pages';
import type { ExperienceCategoryId } from '@/data';
import type { Booth } from '@/data';
import {
  createFeedback,
  createRecruiterContact,
  type IeumProjectDetail,
} from '@/api/ieumApi';
import { loadSavedBusinessCard } from '@/storage/businessCardStorage';
import {
  hasDismissedMapTutorial,
  hasDismissedOnboardingGuide,
  hasCompletedInitialOnboarding,
  hasRecruiterPurpose,
  hasSubmittedMemberContact,
  hasSubmittedProjectAction,
  markMapTutorialDismissed,
  markMemberContactSubmitted,
  markOnboardingGuideDismissed,
  markProjectActionSubmitted,
} from '@/storage/userInteractionStorage';
import { buildSurveyStartPath } from '@/utils/surveyReturn';
import {
  findBoothBySlot,
  normalizeBoothSlot,
  resolveProjectForBooth,
} from '@/utils/boothProjectResolver';
import SplashScreen from '@/pages/Splash/SplashScreen';
import Information from '@/pages/Survey/Information';
import Agreement1 from '@/pages/Survey/Agreement1';
import Agreement2 from '@/pages/Survey/Agreement2';
import Age from '@/pages/Survey/Age';
import Gender from '@/pages/Survey/Gender';
import Purpose from '@/pages/Survey/Purpose';

type AppPage =
  | 'map'
  | 'qr-scan'
  | 'service-intro'
  | 'business-card'
  | 'category-list'
  | 'hire'
  | 'member-projects'
  | 'member-project-view'
  | 'feedback';

type ServiceIntroBackTarget = 'map' | 'category-list';

const VALID_PAGES = new Set<AppPage>([
  'map',
  'qr-scan',
  'service-intro',
  'business-card',
  'category-list',
  'hire',
  'member-projects',
  'member-project-view',
  'feedback',
]);

function getInitialPageState(): {
  page: AppPage;
  cat: ExperienceCategoryId;
  projectId: string | null;
  boothSlot: string | null;
  actionsEnabled: boolean;
  forceGuide: boolean;
} {
  if (typeof window === 'undefined') {
    return {
      page: 'map',
      cat: 'global',
      projectId: null,
      boothSlot: null,
      actionsEnabled: false,
      forceGuide: false,
    };
  }
  const params = new URLSearchParams(window.location.search);
  const pathBoothSlot = normalizeBoothSlot(
    parsePathValue(window.location.pathname, ['booths', 'booth', 'b']),
  );
  const pathProjectId =
    parsePathValue(window.location.pathname, ['projects', 'project', 'p']);
  const pageParam = params.get('page');
  const catParam = params.get('cat') as ExperienceCategoryId | null;
  const projectId = params.get('projectId') ?? pathProjectId;
  const boothSlot = normalizeBoothSlot(params.get('boothSlot')) ?? pathBoothSlot;
  const isEntryRoute = Boolean(pathProjectId || pathBoothSlot);
  const page =
    pageParam && VALID_PAGES.has(pageParam as AppPage)
      ? (pageParam as AppPage)
      : projectId || boothSlot
        ? 'service-intro'
      : 'map';
  const cat = catParam ?? 'global';
  return {
    page,
    cat,
    projectId,
    boothSlot,
    actionsEnabled: params.get('actions') === '1' || isEntryRoute,
    forceGuide: params.get('guide') === '1' || isEntryRoute,
  };
}

function MainAppFlow() {
  const navigate = useNavigate();
  const initial = getInitialPageState();
  const initialGuideDismissed = hasDismissedOnboardingGuide();
  const initialMapTutorialDismissed = hasDismissedMapTutorial();
  const [page, setPage] = useState<AppPage>(initial.page);
  const [serviceVisited, setServiceVisited] = useState(
    !initial.actionsEnabled || !initial.forceGuide || initialGuideDismissed,
  );
  const [guideDismissed, setGuideDismissed] = useState(initialGuideDismissed);
  const [mapTutorialDismissed, setMapTutorialDismissed] = useState(
    initialMapTutorialDismissed,
  );
  const [actionsEnabled, setActionsEnabled] = useState(initial.actionsEnabled);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] =
    useState<ExperienceCategoryId>(initial.cat);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    initial.projectId,
  );
  const [pendingBoothSlot, setPendingBoothSlot] = useState<string | null>(
    initial.boothSlot,
  );
  const [isResolvingBooth, setIsResolvingBooth] = useState(
    Boolean(initial.boothSlot && !initial.projectId),
  );
  const [selectedProject, setSelectedProject] =
    useState<IeumProjectDetail | null>(null);
  const [serviceIntroBackTarget, setServiceIntroBackTarget] =
    useState<ServiceIntroBackTarget>('map');
  const [memberProjectsTarget, setMemberProjectsTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [viewerProjectId, setViewerProjectId] = useState<string | null>(null);

  const goToServiceIntro = useCallback(() => {
    setPage('service-intro');
  }, []);

  const goToMap = useCallback(() => {
    setPage('map');
    navigate('/app', { replace: true });
  }, [navigate]);

  const handleServiceIntroBack = useCallback(() => {
    if (serviceIntroBackTarget === 'map') {
      goToMap();
      return;
    }
    setPage(serviceIntroBackTarget);
  }, [goToMap, serviceIntroBackTarget]);

  const handleProjectLoaded = useCallback((project: IeumProjectDetail) => {
    setSelectedProject(project);
  }, []);

  useEffect(() => {
    if (!pendingBoothSlot) return;

    let active = true;
    const booth = findBoothBySlot(pendingBoothSlot);

    if (!booth) {
      Promise.resolve().then(() => {
        if (!active) return;
        setIsResolvingBooth(false);
        setPendingBoothSlot(null);
        goToMap();
      });
      return;
    }

    resolveProjectForBooth(booth)
      .then((resolved) => {
        if (!active) return;
        setSelectedCategory(resolved?.categoryId ?? booth.categoryId);
        setSelectedProject(null);
        setActionsEnabled(true);
        setGuideDismissed(hasDismissedOnboardingGuide());
        setServiceVisited(hasDismissedOnboardingGuide());
        setServiceIntroBackTarget('map');
        if (!resolved) {
          setPage('category-list');
          return;
        }
        setSelectedProjectId(resolved.project.id);
        goToServiceIntro();
      })
      .catch((error: unknown) => {
        if (!(error instanceof Error)) throw error;
        if (!active) return;
        setPage('category-list');
      })
      .finally(() => {
        if (!active) return;
        setPendingBoothSlot(null);
        setIsResolvingBooth(false);
      });

    return () => {
      active = false;
    };
  }, [goToMap, goToServiceIntro, pendingBoothSlot]);

  const handleBoothPick = useCallback(
    async (booth: Booth) => {
      setSelectedCategory(booth.categoryId);
      setSelectedProject(null);
      setActionsEnabled(false);
      setServiceVisited(true);
      setToast(null);

      try {
        const resolved = await resolveProjectForBooth(booth);

        if (!resolved) {
          setPage('category-list');
          return;
        }

        setSelectedCategory(resolved.categoryId);
        setSelectedProjectId(resolved.project.id);
        setServiceIntroBackTarget('map');
        goToServiceIntro();
      } catch (error) {
        if (!(error instanceof Error)) throw error;
        setPage('category-list');
      }
    },
    [goToServiceIntro],
  );

  const handleFeedbackSubmit = useCallback(
    async (message: string) => {
      if (!selectedProjectId || selectedProject?.acceptsFeedback === false) return;
      if (hasSubmittedProjectAction('feedback', selectedProjectId)) {
        setToast('이미 피드백을 남겼습니다');
        setServiceVisited(true);
        goToServiceIntro();
        return;
      }
      try {
        await createFeedback(selectedProjectId, message);
        markProjectActionSubmitted('feedback', selectedProjectId);
        setToast('소중한 의견 감사합니다');
      } catch (error) {
        if (!(error instanceof Error)) throw error;
        setToast('피드백 전송에 실패했습니다');
      }
      setServiceVisited(true);
      goToServiceIntro();
    },
    [goToServiceIntro, selectedProject?.acceptsFeedback, selectedProjectId],
  );

  const handleHireSubmit = useCallback(
    async (memberId: string) => {
      if (!selectedProjectId) return;
      if (hasSubmittedMemberContact(selectedProjectId, memberId)) {
        setToast('이미 해당 팀원에게 채용 의사를 전달했습니다');
        setServiceVisited(true);
        goToServiceIntro();
        return;
      }
      try {
        const savedBusinessCard = loadSavedBusinessCard();
        await createRecruiterContact(
          selectedProjectId,
          memberId,
          savedBusinessCard?.card ?? null,
          savedBusinessCard?.visitorProfileId ?? null,
        );
        markMemberContactSubmitted(selectedProjectId, memberId);
        setToast('채용 의사가 성공적으로 전달되었습니다');
      } catch (error) {
        if (!(error instanceof Error)) throw error;
        setToast('채용 의사 전달에 실패했습니다');
      }
      setServiceVisited(true);
      goToServiceIntro();
    },
    [goToServiceIntro, selectedProjectId],
  );

  const allMembersContacted = Boolean(
    selectedProjectId &&
      selectedProject &&
      selectedProject.id === selectedProjectId &&
      selectedProject.members.length > 0 &&
      selectedProject.members.every((member) =>
        hasSubmittedMemberContact(selectedProjectId, member.id),
      ),
  );

  const renderPage = () => {
    const effectivePage: AppPage =
      page === 'member-projects' && !memberProjectsTarget ? 'map' : page;
    switch (effectivePage) {
      case 'qr-scan':
        return (
          <QrScanPage
            onBack={goToMap}
            onScanned={(payload) => {
              const entry = parseQrPayload(payload);
              const hasSeenGuide = hasDismissedOnboardingGuide();
              setActionsEnabled(true);
              setServiceVisited(hasSeenGuide);
              setGuideDismissed(hasSeenGuide);
              setToast(null);
              setServiceIntroBackTarget('map');
              if (entry.kind === 'project') {
                setSelectedProjectId(entry.projectId);
                setSelectedProject(null);
                goToServiceIntro();
                return;
              }
              if (entry.kind === 'booth') {
                navigate(`/b/${encodeURIComponent(entry.boothSlot)}`, {
                  replace: true,
                });
                return;
              }
              setToast('QR을 인식하지 못했습니다');
            }}
          />
        );
      case 'service-intro':
        return (
          <ServiceIntroPage
            projectId={selectedProjectId}
            isResolvingProject={isResolvingBooth}
            actionsEnabled={actionsEnabled}
            canHire={actionsEnabled && hasRecruiterPurpose()}
            onBack={handleServiceIntroBack}
            onHire={() => setPage('hire')}
            onFeedback={() => {
              if (selectedProject?.acceptsFeedback === false) return;
              setPage('feedback');
            }}
            onProjectLoaded={handleProjectLoaded}
            showGuide={!serviceVisited && !guideDismissed}
            onGuideDismiss={() => {
              markOnboardingGuideDismissed();
              setGuideDismissed(true);
              setServiceVisited(true);
            }}
            feedbackSubmitted={
              selectedProjectId
                ? hasSubmittedProjectAction('feedback', selectedProjectId)
                : false
            }
            contactSubmitted={allMembersContacted}
            toast={toast}
            onToastDismiss={() => setToast(null)}
          />
        );
      case 'hire':
        return (
          <HirePage
            members={(selectedProject?.members ?? []).map((member) => ({
              id: member.id,
              name: member.name,
              role: roleLabel(member.roles),
              hired: selectedProjectId
                ? hasSubmittedMemberContact(selectedProjectId, member.id)
                : false,
            }))}
            onBack={() => setPage('service-intro')}
            onSubmit={handleHireSubmit}
            onViewMemberProjects={(member) => {
              setMemberProjectsTarget({ id: member.id, name: member.name });
              setPage('member-projects');
            }}
          />
        );
      case 'member-projects':
        return memberProjectsTarget ? (
          <MemberProjectsPage
            memberId={memberProjectsTarget.id}
            memberName={memberProjectsTarget.name}
            excludeProjectId={selectedProjectId}
            onBack={() => setPage('hire')}
            onPickProject={(project) => {
              setViewerProjectId(project.id);
              setPage('member-project-view');
            }}
          />
        ) : null;
      case 'member-project-view':
        return (
          <ServiceIntroPage
            projectId={viewerProjectId}
            actionsEnabled={false}
            canHire={false}
            onBack={() => setPage('member-projects')}
            onHire={() => undefined}
            onFeedback={() => undefined}
            onProjectLoaded={() => undefined}
            showGuide={false}
            onGuideDismiss={() => undefined}
            feedbackSubmitted={false}
            contactSubmitted={false}
          />
        );
      case 'feedback':
        return (
          <FeedbackPage
            onBack={() => setPage('service-intro')}
            onSubmit={handleFeedbackSubmit}
          />
        );
      case 'business-card':
        return <BusinessCardPage />;
      case 'category-list':
        return (
          <CategoryListPage
            categoryId={selectedCategory}
            onBack={goToMap}
            onPickProject={(project) => {
              setSelectedProjectId(project.id);
              setSelectedProject(null);
              setActionsEnabled(false);
              setServiceVisited(true);
              setToast(null);
              setServiceIntroBackTarget('category-list');
              goToServiceIntro();
            }}
          />
        );
      case 'map':
      default:
        return (
          <MapPage
            onClickQr={() => setPage('qr-scan')}
            onPickBooth={handleBoothPick}
            onPickCategory={(categoryId) => {
              setSelectedCategory(categoryId);
              setPage('category-list');
            }}
            showTutorial={!mapTutorialDismissed}
            onTutorialDismiss={() => {
              markMapTutorialDismissed();
              setMapTutorialDismissed(true);
            }}
          />
        );
    }
  };

  return renderPage();
}

function ProjectEntryRoute() {
  const { projectId } = useParams<{ projectId: string }>();
  if (!projectId) {
    return <Navigate to="/app" replace />;
  }
  const target = `/app?page=service-intro&projectId=${encodeURIComponent(projectId)}&actions=1&guide=1`;
  if (!hasCompletedInitialOnboarding()) {
    return <Navigate to={buildSurveyStartPath(target)} replace />;
  }

  return (
    <Navigate
      to={target}
      replace
    />
  );
}

function MainAppRoute() {
  const location = useLocation();
  return <MainAppFlow key={`${location.pathname}${location.search}`} />;
}

function BoothEntryRoute() {
  const { boothSlot } = useParams<{ boothSlot: string }>();
  const normalizedBoothSlot = normalizeBoothSlot(boothSlot);
  if (!normalizedBoothSlot) {
    return <Navigate to="/app" replace />;
  }
  if (!hasCompletedInitialOnboarding()) {
    return <Navigate to={buildSurveyStartPath(`/b/${normalizedBoothSlot}`)} replace />;
  }

  return <MainAppRoute />;
}

const ROLE_LABELS: Record<string, string> = {
  backend: 'BE',
  frontend: 'FE',
  design: 'DE',
  pm: 'PM',
  ai: 'AI',
};

function roleLabel(roles: string[]): string {
  const labels = roles.map((role) => ROLE_LABELS[role] ?? role);
  return labels.length ? labels.join(', ') : 'MEMBER';
}

type QrEntry =
  | { readonly kind: 'project'; readonly projectId: string }
  | { readonly kind: 'booth'; readonly boothSlot: string }
  | { readonly kind: 'unknown' };

function parseQrPayload(payload: string): QrEntry {
  const trimmed = payload.trim();
  if (!trimmed) return { kind: 'unknown' };
  const parsedUrl = safeParseUrl(trimmed);
  const projectId =
    parsedUrl?.searchParams.get('projectId') ??
    parsePathValue(parsedUrl?.pathname, ['projects', 'project', 'p']);
  if (projectId) return { kind: 'project', projectId };
  const boothSlot = normalizeBoothSlot(
    parsedUrl?.searchParams.get('boothSlot') ??
    parsePathValue(parsedUrl?.pathname, ['booths', 'booth', 'b']),
  );
  if (boothSlot) return { kind: 'booth', boothSlot };
  const rawBoothSlot = normalizeBoothSlot(trimmed);
  if (rawBoothSlot) {
    return { kind: 'booth', boothSlot: rawBoothSlot };
  }
  return { kind: 'unknown' };
}

function safeParseUrl(value: string): URL | null {
  try {
    return new URL(value, window.location.origin);
  } catch {
    return null;
  }
}

function parsePathValue(pathname: string | undefined, names: readonly string[]): string | null {
  if (!pathname) return null;
  const segments = pathname.split('/').filter(Boolean);
  for (const name of names) {
    const index = segments.indexOf(name);
    if (index < 0) continue;
    const value = segments[index + 1];
    if (value) return decodeURIComponent(value);
  }
  return null;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/survey/information" element={<Information />} />
          <Route path="/survey/agreement1" element={<Agreement1 />} />
          <Route path="/survey/agreement2" element={<Agreement2 />} />
          <Route path="/survey/age" element={<Age />} />
          <Route path="/survey/gender" element={<Gender />} />
          <Route path="/survey/purpose" element={<Purpose />} />
          <Route path="/business-card" element={<BusinessCardPage />} />
          <Route path="/projects/:projectId" element={<ProjectEntryRoute />} />
          <Route path="/project/:projectId" element={<ProjectEntryRoute />} />
          <Route path="/p/:projectId" element={<ProjectEntryRoute />} />
          <Route path="/booths/:boothSlot" element={<BoothEntryRoute />} />
          <Route path="/booth/:boothSlot" element={<BoothEntryRoute />} />
          <Route path="/b/:boothSlot" element={<BoothEntryRoute />} />
          <Route path="/app/*" element={<MainAppRoute />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
