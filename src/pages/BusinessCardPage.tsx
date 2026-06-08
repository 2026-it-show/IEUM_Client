import { useState } from 'react';
import { BackHeader } from '@/components';
import {
  BusinessCardScanSection,
  BusinessCardFormSection,
} from '@/sections';
import type { BusinessCard, BusinessCardField } from '@/data';
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
  const [step, setStep] = useState<Step>('scan');
  const [card, setCard] = useState<BusinessCard>(EMPTY_CARD);

  const handleScanned = (parsed: BusinessCard) => {
    setCard(parsed);
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
    console.log('[BusinessCardPage] submit', card);
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
