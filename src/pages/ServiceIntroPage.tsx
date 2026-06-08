import {
  BackHeader,
  PrototypeGuideOverlay,
  SuccessToast,
} from '@/components';
import { ServiceIntroSection } from '@/sections';
import * as S from './ServiceIntroPage.styled';

interface ServiceIntroPageProps {
  onBack: () => void;
  onHire: () => void;
  onFeedback: () => void;
  showGuide: boolean;
  onGuideDismiss: () => void;
  toast?: string | null;
  onToastDismiss?: () => void;
}

function ServiceIntroPage({
  onBack,
  onHire,
  onFeedback,
  showGuide,
  onGuideDismiss,
  toast,
  onToastDismiss,
}: ServiceIntroPageProps) {
  return (
    <S.Page>
      <BackHeader title="Growy" onBack={onBack} />
      <ServiceIntroSection onFeedback={onFeedback} onHire={onHire} />
      {showGuide && !toast && (
        <PrototypeGuideOverlay onDismiss={onGuideDismiss} />
      )}
      {toast && onToastDismiss && (
        <SuccessToast message={toast} onDismiss={onToastDismiss} />
      )}
    </S.Page>
  );
}

export default ServiceIntroPage;
