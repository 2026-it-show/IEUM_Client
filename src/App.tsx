import { useState } from 'react';
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

function getInitialPageState(): { page: AppPage; cat: ExperienceCategoryId } {
  if (typeof window === 'undefined') return { page: 'map', cat: 'global' };
  const params = new URLSearchParams(window.location.search);
  const pageParam = params.get('page');
  const catParam = params.get('cat') as ExperienceCategoryId | null;
  const page =
    pageParam && VALID_PAGES.has(pageParam as AppPage)
      ? (pageParam as AppPage)
      : 'map';
  const cat = catParam ?? 'global';
  return { page, cat };
}

function MainAppFlow() {
  const initial = getInitialPageState();
  const [page, setPage] = useState<AppPage>(initial.page);
  const [serviceVisited, setServiceVisited] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] =
    useState<ExperienceCategoryId>(initial.cat);

  const goToServiceIntro = () => {
    setPage('service-intro');
  };

  const renderPage = () => {
    switch (page) {
      case 'qr-scan':
        return (
          <QrScanPage
            onBack={() => setPage('map')}
            onScanned={() => {
              setServiceVisited(false);
              setToast(null);
              goToServiceIntro();
            }}
          />
        );
      case 'service-intro':
        return (
          <ServiceIntroPage
            onBack={() => setPage('category-list')}
            onHire={() => setPage('hire')}
            onFeedback={() => setPage('feedback')}
            showGuide={!serviceVisited}
            onGuideDismiss={() => setServiceVisited(true)}
            toast={toast}
            onToastDismiss={() => setToast(null)}
          />
        );
      case 'hire':
        return (
          <HirePage
            onBack={() => setPage('service-intro')}
            onSubmit={() => {
              setToast('채용 의사가 성공적으로 전달되었습니다');
              setServiceVisited(true);
              goToServiceIntro();
            }}
          />
        );
      case 'feedback':
        return (
          <FeedbackPage
            onBack={() => setPage('service-intro')}
            onSubmit={() => {
              setToast('소중한 의견 감사합니다');
              setServiceVisited(true);
              goToServiceIntro();
            }}
          />
        );
      case 'business-card':
        return <BusinessCardPage />;
      case 'category-list':
        return (
          <CategoryListPage
            categoryId={selectedCategory}
            onBack={() => setPage('map')}
            onPickProject={() => {
              setServiceVisited(false);
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
