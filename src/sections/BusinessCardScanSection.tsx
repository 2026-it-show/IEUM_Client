import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createRecruiterVisitorProfileFromBusinessCards,
  type IeumVisitorProfile,
} from '@/api/ieumApi';
import type { BusinessCard } from '@/data';
import { detectBusinessCardFromImageData } from '@/utils/businessCardDetection';
import * as S from './BusinessCardScanSection.styled';

interface BusinessCardScanResult {
  readonly card: BusinessCard;
  readonly visitorProfileId: string;
}

interface BusinessCardScanSectionProps {
  onScanned: (result: BusinessCardScanResult) => void;
}

type ScanStep = 'front' | 'back';

const CAMERA_CONSTRAINTS: MediaStreamConstraints = {
  video: { facingMode: { ideal: 'environment' } },
  audio: false,
};

const DETECTION_INTERVAL_MS = 220;
const REQUIRED_STABLE_DETECTIONS = 4;
const DETECTION_SAMPLE_WIDTH = 176;
const DETECTION_SAMPLE_HEIGHT = 112;
const DETECTION_COOLDOWN_MS = 900;

function BusinessCardScanSection({ onScanned }: BusinessCardScanSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frontFileRef = useRef<File | null>(null);
  const isCapturingRef = useRef(false);
  const stableDetectionCountRef = useRef(0);
  const lastCaptureAtRef = useRef(0);
  const [step, setStep] = useState<ScanStep>('front');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCardDetected, setIsCardDetected] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
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
      cancelled = true;
      if (streamRef.current) {
        stopStream(streamRef.current);
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
      });
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      setErrorMessage('명함 인식에 실패했습니다. 다시 찍거나 직접 입력해주세요');
    } finally {
      setIsUploading(false);
    }
  }, [onScanned]);

  const handleCapturedFile = useCallback((file: File) => {
    if (step === 'front') {
      frontFileRef.current = file;
      setStep('back');
      setIsCardDetected(false);
      stableDetectionCountRef.current = 0;
      setErrorMessage(null);
      return;
    }
    const frontFile = frontFileRef.current;
    if (!frontFile) {
      setStep('front');
      setErrorMessage('앞면부터 다시 찍어주세요');
      return;
    }
    void uploadCards(frontFile, file);
  }, [step, uploadCards]);

  const captureCurrentStep = useCallback(async () => {
    if (isCapturingRef.current || isUploading) return;
    isCapturingRef.current = true;
    try {
      handleCapturedFile(await captureVideoFrame(videoRef.current, canvasRef.current, step));
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      setErrorMessage('명함을 프레임에 맞춰 다시 비춰주세요');
    } finally {
      isCapturingRef.current = false;
    }
  }, [handleCapturedFile, isUploading, step]);

  useEffect(() => {
    stableDetectionCountRef.current = 0;
  }, [step]);

  useEffect(() => {
    if (!isCameraReady || isUploading) return undefined;
    const interval = window.setInterval(() => {
      if (isCapturingRef.current) return;
      const now = window.performance.now();
      if (now - lastCaptureAtRef.current < DETECTION_COOLDOWN_MS) return;

      const detected = detectVisibleBusinessCard(videoRef.current, canvasRef.current);
      setIsCardDetected(detected);
      stableDetectionCountRef.current = detected
        ? stableDetectionCountRef.current + 1
        : 0;

      if (stableDetectionCountRef.current >= REQUIRED_STABLE_DETECTIONS) {
        stableDetectionCountRef.current = 0;
        lastCaptureAtRef.current = now;
        void captureCurrentStep();
      }
    }, DETECTION_INTERVAL_MS);
    return () => {
      window.clearInterval(interval);
    };
  }, [captureCurrentStep, isCameraReady, isUploading, step]);

  return (
    <S.Wrapper>
      <S.CameraArea>
        <S.Video ref={videoRef} playsInline muted autoPlay />
        <S.Frame aria-hidden="true" />
      </S.CameraArea>
      <S.Hint>
        {isUploading
          ? '명함 정보를 불러오는 중입니다'
          : `${step === 'front' ? '앞면' : '뒷면'}을 프레임 안에 맞추면 자동으로 촬영돼요`}
      </S.Hint>
      <S.StatusText $active={isCardDetected}>
        {isCardDetected ? '명함을 인식했어요' : '명함을 찾는 중'}
      </S.StatusText>
      {errorMessage ? <S.ErrorText>{errorMessage}</S.ErrorText> : null}
      <canvas ref={canvasRef} hidden />
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
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) {
        resolve(result);
        return;
      }
      reject(new Error('Failed to capture image'));
    }, 'image/jpeg', 0.9);
  });
  return new File([blob], `business-card-${step}.jpg`, { type: 'image/jpeg' });
}

function detectVisibleBusinessCard(
  video: HTMLVideoElement | null,
  canvas: HTMLCanvasElement | null,
): boolean {
  if (!video || !canvas || video.videoWidth === 0 || video.videoHeight === 0) {
    return false;
  }

  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return false;

  const sourceWidth = video.videoWidth * 0.78;
  const sourceHeight = video.videoHeight * 0.7;
  const sourceX = (video.videoWidth - sourceWidth) / 2;
  const sourceY = (video.videoHeight - sourceHeight) / 2;

  canvas.width = DETECTION_SAMPLE_WIDTH;
  canvas.height = DETECTION_SAMPLE_HEIGHT;
  context.drawImage(
    video,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    DETECTION_SAMPLE_WIDTH,
    DETECTION_SAMPLE_HEIGHT,
  );

  const imageData = context.getImageData(
    0,
    0,
    DETECTION_SAMPLE_WIDTH,
    DETECTION_SAMPLE_HEIGHT,
  );
  return detectBusinessCardFromImageData(imageData).detected;
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
