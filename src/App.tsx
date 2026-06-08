import { useCallback, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
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
import type { ExperienceCategoryId } from '@/data';
import type { Booth } from '@/data';
import {
  createFeedback,
  createRecruiterContact,
  listProjectsByCategory,
  type IeumProjectDetail,
} from '@/api/ieumApi';
import { loadBusinessCard } from '@/storage/businessCardStorage';
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
  actionsEnabled: boolean;
} {
  if (typeof window === 'undefined') {
    return { page: 'map', cat: 'global', projectId: null, actionsEnabled: false };
  }
  const params = new URLSearchParams(window.location.search);
  const pageParam = params.get('page');
  const catParam = params.get('cat') as ExperienceCategoryId | null;
  const page =
    pageParam && VALID_PAGES.has(pageParam as AppPage)
      ? (pageParam as AppPage)
      : 'map';
  const cat = catParam ?? 'global';
  return {
    page,
    cat,
    projectId: params.get('projectId'),
    actionsEnabled: params.get('actions') === '1',
  };
}

function MainAppFlow() {
  const initial = getInitialPageState();
  const [page, setPage] = useState<AppPage>(initial.page);
  const [serviceVisited, setServiceVisited] = useState(!initial.actionsEnabled);
  const [actionsEnabled, setActionsEnabled] = useState(initial.actionsEnabled);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] =
    useState<ExperienceCategoryId>(initial.cat);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    initial.projectId,
  );
  const [selectedProject, setSelectedProject] =
    useState<IeumProjectDetail | null>(null);

  const goToServiceIntro = useCallback(() => {
    setPage('service-intro');
  }, []);

  const handleProjectLoaded = useCallback((project: IeumProjectDetail) => {
    setSelectedProject(project);
  }, []);

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
      if (!selectedProjectId) return;
      try {
        await createFeedback(selectedProjectId, message);
        setToast('소중한 의견 감사합니다');
      } catch (error) {
        if (!(error instanceof Error)) throw error;
        setToast('피드백 전송에 실패했습니다');
      }
      setServiceVisited(true);
      goToServiceIntro();
    },
    [goToServiceIntro, selectedProjectId],
  );

  const handleHireSubmit = useCallback(
    async (memberId: string) => {
      if (!selectedProjectId) return;
      try {
        await createRecruiterContact(
          selectedProjectId,
          memberId,
          loadBusinessCard(),
        );
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
              goToServiceIntro();
            }}
          />
        );
      case 'service-intro':
        return (
          <ServiceIntroPage
            projectId={selectedProjectId}
            actionsEnabled={actionsEnabled}
            onBack={() => setPage(actionsEnabled ? 'map' : 'category-list')}
            onHire={() => setPage('hire')}
            onFeedback={() => setPage('feedback')}
            onProjectLoaded={handleProjectLoaded}
            showGuide={!serviceVisited}
            onGuideDismiss={() => setServiceVisited(true)}
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
          />
        );
    }
  };

  return renderPage();
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
          <Route path="/app/*" element={<MainAppFlow />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
