import { useCallback, useEffect, useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
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
  QrScanPage,
  ServiceIntroPage,
} from '@/pages';
import { BOOTHS, type ExperienceCategoryId } from '@/data';
import type { Booth } from '@/data';
import {
  createFeedback,
  createRecruiterContact,
  listProjectsByCategory,
  type IeumProjectDetail,
} from '@/api/ieumApi';
import { loadBusinessCard } from '@/storage/businessCardStorage';
import {
  hasDismissedMapTutorial,
  hasDismissedOnboardingGuide,
  hasSubmittedProjectAction,
  markMapTutorialDismissed,
  markOnboardingGuideDismissed,
  markProjectActionSubmitted,
} from '@/storage/userInteractionStorage';
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
  | 'feedback';

type ServiceIntroBackTarget = 'map' | 'category-list';

const VALID_PAGES = new Set<AppPage>([
  'map',
  'qr-scan',
  'service-intro',
  'business-card',
  'category-list',
  'hire',
  'feedback',
]);

function getInitialPageState(): {
  page: AppPage;
  cat: ExperienceCategoryId;
  projectId: string | null;
  boothSlot: string | null;
  actionsEnabled: boolean;
} {
  if (typeof window === 'undefined') {
    return {
      page: 'map',
      cat: 'global',
      projectId: null,
      boothSlot: null,
      actionsEnabled: false,
    };
  }
  const params = new URLSearchParams(window.location.search);
  const pageParam = params.get('page');
  const catParam = params.get('cat') as ExperienceCategoryId | null;
  const projectId = params.get('projectId');
  const boothSlot = params.get('boothSlot');
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
    actionsEnabled: params.get('actions') === '1',
  };
}

function MainAppFlow() {
  const initial = getInitialPageState();
  const initialGuideDismissed = hasDismissedOnboardingGuide();
  const initialMapTutorialDismissed = hasDismissedMapTutorial();
  const [page, setPage] = useState<AppPage>(initial.page);
  const [serviceVisited, setServiceVisited] = useState(
    !initial.actionsEnabled || initialGuideDismissed,
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

  const goToServiceIntro = useCallback(() => {
    setPage('service-intro');
  }, []);

  const handleProjectLoaded = useCallback((project: IeumProjectDetail) => {
    setSelectedProject(project);
  }, []);

  useEffect(() => {
    if (!pendingBoothSlot) return;

    let active = true;
    const normalizedSlot = pendingBoothSlot.trim().toUpperCase();
    const booth = BOOTHS.find(
      (item) =>
        !item.aux &&
        item.serviceName &&
        item.title.toUpperCase() === normalizedSlot,
    );

    if (!booth) {
      Promise.resolve().then(() => {
        if (!active) return;
        setIsResolvingBooth(false);
        setPendingBoothSlot(null);
        setPage('map');
      });
      return;
    }

    listProjectsByCategory(booth.categoryId)
      .then((projects) => {
        if (!active) return;
        setSelectedCategory(booth.categoryId);
        setSelectedProject(null);
        setActionsEnabled(true);
        setServiceVisited(false);
        setServiceIntroBackTarget('map');
        const project =
          projects.find((item) => item.boothSlot === booth.title) ??
          projects.find((item) => item.serviceName === booth.serviceName);
        if (!project) {
          setPage('category-list');
          return;
        }
        setSelectedProjectId(project.id);
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
  }, [goToServiceIntro, pendingBoothSlot]);

  const handleBoothPick = useCallback(
    async (booth: Booth) => {
      setSelectedCategory(booth.categoryId);
      setSelectedProject(null);
      setActionsEnabled(false);
      setServiceVisited(true);
      setToast(null);

      try {
        const projects = await listProjectsByCategory(booth.categoryId);
        const project =
          projects.find((item) => item.boothSlot === booth.title) ??
          projects.find((item) => item.serviceName === booth.serviceName);

        if (!project) {
          setPage('category-list');
          return;
        }

        setSelectedProjectId(project.id);
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
      if (hasSubmittedProjectAction('contact', selectedProjectId)) {
        setToast('이미 채용 의사를 전달했습니다');
        setServiceVisited(true);
        goToServiceIntro();
        return;
      }
      try {
        await createRecruiterContact(
          selectedProjectId,
          memberId,
          loadBusinessCard(),
        );
        markProjectActionSubmitted('contact', selectedProjectId);
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

  const renderPage = () => {
    switch (page) {
      case 'qr-scan':
        return (
          <QrScanPage
            onBack={() => setPage('map')}
            onScanned={() => {
              setActionsEnabled(true);
              setServiceVisited(false);
              setToast(null);
              setServiceIntroBackTarget('map');
              goToServiceIntro();
            }}
          />
        );
      case 'service-intro':
        return (
          <ServiceIntroPage
            projectId={selectedProjectId}
            isResolvingProject={isResolvingBooth}
            actionsEnabled={actionsEnabled}
            onBack={() => setPage(serviceIntroBackTarget)}
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
            contactSubmitted={
              selectedProjectId
                ? hasSubmittedProjectAction('contact', selectedProjectId)
                : false
            }
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
            }))}
            onBack={() => setPage('service-intro')}
            onSubmit={handleHireSubmit}
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
            onBack={() => setPage('map')}
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

  return (
    <Navigate
      to={`/app?page=service-intro&projectId=${encodeURIComponent(projectId)}&actions=1`}
      replace
    />
  );
}

function BoothEntryRoute() {
  const { boothSlot } = useParams<{ boothSlot: string }>();
  if (!boothSlot) {
    return <Navigate to="/app" replace />;
  }

  return (
    <Navigate
      to={`/app?page=service-intro&boothSlot=${encodeURIComponent(boothSlot)}&actions=1`}
      replace
    />
  );
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
          <Route path="/app/*" element={<MainAppFlow />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
