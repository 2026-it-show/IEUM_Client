import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const PageWrapper = styled.div`
  width: 100%;
  height: 100%;
  min-height: 100dvh;
  background-color: #ec5665;
`;

const MobileContainer = styled.div`
  --large-logo-width: min(76vw, 330px);
  width: 100%;
  height: 100%;
  min-height: 100dvh;
  background-color: #ec5665;
  position: relative;
  overflow: hidden;
`;

const SplashLogo = styled.img`
  width: var(--large-logo-width);
  height: auto;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      navigate('/survey/information');
    }, 2600);
    return () => window.clearTimeout(timeoutId);
  }, [navigate]);

  return (
    <PageWrapper>
      <MobileContainer>
        <SplashLogo src="/assets/splash/ieum-splash-logo.apng" alt="IEUM" />
      </MobileContainer>
    </PageWrapper>
  );
}

export default SplashScreen;
