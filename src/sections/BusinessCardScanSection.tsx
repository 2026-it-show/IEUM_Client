import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createRecruiterVisitorProfileFromBusinessCards,
  type IeumVisitorProfile,
} from '@/api/ieumApi';
import type { BusinessCard } from '@/data';
import * as S from './BusinessCardScanSection.styled';

interface BusinessCardScanResult {
  readonly card: BusinessCard;
  readonly visitorProfileId: string | null;
  readonly isLoading?: boolean;
}

interface BusinessCardScanSectionProps {
  onScanned: (result: BusinessCardScanResult) => void;
}

type ScanStep = 'front' | 'back';

const CAMERA_CONSTRAINTS: MediaStreamConstraints = {
  video: {
    facingMode: { ideal: 'environment' },
    width: { ideal: 1920 },
    height: { ideal: 1080 },
  },
  audio: false,
};

const NEXT_SIDE_PREPARE_MS = 2200;
const EMPTY_CARD: BusinessCard = {
  companyName: '',
  companyAddress: '',
  name: '',
  position: '',
  phone: '',
  email: '',
};

function BusinessCardScanSection({ onScanned }: BusinessCardScanSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frontFileRef = useRef<File | null>(null);
  const isCapturingRef = useRef(false);
  const isMountedRef = useRef(true);
  const prepareTimerRef = useRef<number | null>(null);
  const [step, setStep] = useState<ScanStep>('front');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPreparingNextSide, setIsPreparingNextSide] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia(CAMERA_CONSTRAINTS)
      .then((stream) => {
        if (cancelled) {
          stopStream(stream);
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          setIsCameraReady(true);
        };
        void video.play();
      })
      .catch(() => {
        setErrorMessage('카메라 권한을 허용해주세요');
      });

    return () => {
      isMountedRef.current = false;
      cancelled = true;
      if (streamRef.current) {
        stopStream(streamRef.current);
      }
      if (prepareTimerRef.current !== null) {
        window.clearTimeout(prepareTimerRef.current);
      }
    };
  }, []);

  const uploadCards = useCallback(async (frontFile: File, backFile: File) => {
    setIsUploading(true);
    setErrorMessage(null);
    try {
      const profile = await createRecruiterVisitorProfileFromBusinessCards(
        frontFile,
        backFile,
      );
      onScanned({
        card: businessCardFromProfile(profile),
        visitorProfileId: profile.id,
        isLoading: false,
      });
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      onScanned({
        card: EMPTY_CARD,
        visitorProfileId: null,
        isLoading: false,
      });
      if (isMountedRef.current) {
        setErrorMessage('명함 인식에 실패했습니다. 다시 찍거나 직접 입력해주세요');
      }
    } finally {
      if (isMountedRef.current) {
        setIsUploading(false);
      }
    }
  }, [onScanned]);

  const handleCapturedFile = useCallback((file: File) => {
    if (step === 'front') {
      frontFileRef.current = file;
      setStep('back');
      setIsPreparingNextSide(true);
      if (prepareTimerRef.current !== null) {
        window.clearTimeout(prepareTimerRef.current);
      }
      prepareTimerRef.current = window.setTimeout(() => {
        if (isMountedRef.current) {
          setIsPreparingNextSide(false);
        }
      }, NEXT_SIDE_PREPARE_MS);
      setErrorMessage(null);
      return;
    }
    const frontFile = frontFileRef.current;
    if (!frontFile) {
      setStep('front');
      setErrorMessage('앞면부터 다시 찍어주세요');
      return;
    }
    onScanned({ card: EMPTY_CARD, visitorProfileId: null, isLoading: true });
    void uploadCards(frontFile, file);
  }, [onScanned, step, uploadCards]);

  const captureManually = useCallback(async () => {
    if (isCapturingRef.current || isUploading) return;
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) return;
    isCapturingRef.current = true;
    try {
      handleCapturedFile(
        await captureVideoFrame(video, canvasRef.current, step),
      );
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      setErrorMessage('촬영에 실패했습니다. 다시 시도해주세요');
    } finally {
      isCapturingRef.current = false;
    }
  }, [handleCapturedFile, isUploading, step]);

  return (
    <S.Wrapper>
      <S.Content>
        <S.CameraArea>
          <S.Video ref={videoRef} playsInline muted autoPlay />
          {isPreparingNextSide ? (
            <S.StepNotice role="status" aria-live="polite">
              <S.StepNoticeTitle>앞면 촬영 완료</S.StepNoticeTitle>
              <S.StepNoticeText>명함을 뒤집어 뒷면을 보여주세요</S.StepNoticeText>
            </S.StepNotice>
          ) : null}
        </S.CameraArea>
        <S.Hint>
          {isUploading
            ? '명함 정보를 불러오는 중입니다'
            : isPreparingNextSide
              ? '이제 뒷면을 프레임 안에 맞춰주세요'
              : `${step === 'front' ? '앞면' : '뒷면'}을 프레임 안에 맞춘 뒤 촬영 버튼을 눌러주세요`}
        </S.Hint>
        <S.StatusText $active={isCameraReady && !isUploading}>
          {isPreparingNextSide
            ? '뒷면 촬영을 준비 중'
            : isCameraReady
              ? '촬영 준비 완료'
              : '카메라를 준비 중'}
        </S.StatusText>
        {errorMessage ? <S.ErrorText>{errorMessage}</S.ErrorText> : null}
      </S.Content>
      <S.BottomAction>
        <S.ShutterButton
          type="button"
          disabled={!isCameraReady || isUploading || isPreparingNextSide}
          onClick={() => {
            void captureManually();
          }}
        >
          {step === 'front' ? '앞면 촬영' : '뒷면 촬영'}
        </S.ShutterButton>
      </S.BottomAction>
      <S.HiddenCanvas ref={canvasRef} aria-hidden="true" />
    </S.Wrapper>
  );
}

async function captureVideoFrame(
  video: HTMLVideoElement | null,
  canvas: HTMLCanvasElement | null,
  step: ScanStep,
): Promise<File> {
  if (!video || !canvas || video.videoWidth === 0 || video.videoHeight === 0) {
    throw new Error('Camera is not ready');
  }
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas context is not available');
  context.drawImage(
    video,
    0,
    0,
    video.videoWidth,
    video.videoHeight,
    0,
    0,
    canvas.width,
    canvas.height,
  );
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) {
        resolve(result);
        return;
      }
      reject(new Error('Failed to capture image'));
    }, 'image/jpeg', 0.92);
  });
  return new File([blob], `business-card-${step}.jpg`, { type: 'image/jpeg' });
}

function businessCardFromProfile(profile: IeumVisitorProfile): BusinessCard {
  return {
    companyName: profile.ocrOrganization ?? '',
    companyAddress: inferAddress(profile.ocrRawText ?? ''),
    name: profile.ocrName ?? '',
    position: profile.ocrPosition ?? '',
    phone: profile.ocrPhone ?? '',
    email: profile.ocrEmail ?? '',
  };
}

function inferAddress(rawText: string): string {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.find(isAddressLine) ?? '';
}

function isAddressLine(line: string): boolean {
  if (/@/.test(line) || /\d{2,4}[-\s)]\d{3,4}[-\s]\d{4}/.test(line)) {
    return false;
  }
  return /(서울|경기|인천|부산|대구|광주|대전|울산|세종|제주|도|시|군|구|로|길)/.test(line);
}

function stopStream(stream: MediaStream): void {
  for (const track of stream.getTracks()) {
    track.stop();
  }
}

export default BusinessCardScanSection;
