import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackHeader } from '@/components';
import {
  BusinessCardScanSection,
  BusinessCardFormSection,
} from '@/sections';
import type { BusinessCard, BusinessCardField } from '@/data';
import { saveBusinessCard } from '@/storage/businessCardStorage';
import { markInitialOnboardingCompleted } from '@/storage/userInteractionStorage';
import { readSurveyReturnTo } from '@/utils/surveyReturn';
import * as S from './BusinessCardPage.styled';

type Step = 'scan' | 'form';

const EMPTY_CARD: BusinessCard = {
  companyName: '',
  companyAddress: '',
  name: '',
  position: '',
  phone: '',
  email: '',
};

function BusinessCardPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('scan');
  const [card, setCard] = useState<BusinessCard>(EMPTY_CARD);
  const [visitorProfileId, setVisitorProfileId] = useState<string | null>(null);

  const handleScanned = (result: {
    readonly card: BusinessCard;
    readonly visitorProfileId: string;
  }) => {
    setCard(result.card);
    setVisitorProfileId(result.visitorProfileId);
    setStep('form');
  };

  const handleChange = (key: BusinessCardField, value: string) => {
    setCard((prev) => ({ ...prev, [key]: value }));
  };

  const handleBack = () => {
    if (step === 'form') {
      setStep('scan');
      return;
    }
    window.history.back();
  };

  const handleSubmit = () => {
    saveBusinessCard(card, visitorProfileId);
    markInitialOnboardingCompleted();
    navigate(readSurveyReturnTo('/app'), { replace: true });
  };

  return (
    <S.Page $variant={step}>
      <BackHeader
        title="채용 희망"
        onBack={handleBack}
        color={step === 'scan' ? 'light' : 'dark'}
      />
      {step === 'scan' ? (
        <BusinessCardScanSection onScanned={handleScanned} />
      ) : (
        <BusinessCardFormSection
          values={card}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
      )}
    </S.Page>
  );
}

export default BusinessCardPage;
