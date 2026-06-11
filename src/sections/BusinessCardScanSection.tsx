import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createRecruiterVisitorProfileFromBusinessCards,
  type IeumVisitorProfile,
} from '@/api/ieumApi';
import type { BusinessCard } from '@/data';
import {
  boxesAreSimilar,
  detectVisibleBusinessCard,
  smoothDetectionBox,
  toSvgPoints,
  visibleCaptureRect,
  type CaptureRect,
  type DetectionOverlayBox,
} from '@/utils/businessCardCameraDetection';
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

const DETECTION_INTERVAL_MS = 120;
const REQUIRED_STABLE_DETECTIONS = 4;
const DETECTION_MISS_TOLERANCE = 4;
const DETECTION_SMOOTHING = 0.45;
const DETECTION_COOLDOWN_MS = 900;
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
  const stableDetectionCountRef = useRef(0);
  const lastDetectionBoxRef = useRef<DetectionOverlayBox | null>(null);
  const smoothedBoxRef = useRef<DetectionOverlayBox | null>(null);
  const missCountRef = useRef(0);
  const lastCaptureAtRef = useRef(0);
  const detectionPausedUntilRef = useRef(0);
  const isDetectingRef = useRef(false);
  const prepareTimerRef = useRef<number | null>(null);
  const [step, setStep] = useState<ScanStep>('front');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCardDetected, setIsCardDetected] = useState(false);
  const [detectionBox, setDetectionBox] = useState<DetectionOverlayBox | null>(
    null,
  );
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
      setIsCardDetected(false);
      setDetectionBox(null);
      setIsPreparingNextSide(true);
      detectionPausedUntilRef.current =
        window.performance.now() + NEXT_SIDE_PREPARE_MS;
      stableDetectionCountRef.current = 0;
      lastDetectionBoxRef.current = null;
      smoothedBoxRef.current = null;
      missCountRef.current = 0;
      lastCaptureAtRef.current = window.performance.now();
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

  const captureCurrentStep = useCallback(async () => {
    if (isCapturingRef.current || isUploading) return;
    const target = smoothedBoxRef.current ?? lastDetectionBoxRef.current;
    if (!target) return;
    isCapturingRef.current = true;
    try {
      handleCapturedFile(
        await captureVideoFrame(
          videoRef.current,
          canvasRef.current,
          step,
          target.captureRect,
        ),
      );
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      setErrorMessage('명함을 프레임에 맞춰 다시 비춰주세요');
    } finally {
      isCapturingRef.current = false;
    }
  }, [handleCapturedFile, isUploading, step]);

  useEffect(() => {
    stableDetectionCountRef.current = 0;
    lastDetectionBoxRef.current = null;
    smoothedBoxRef.current = null;
    missCountRef.current = 0;
  }, [step]);

  const captureManually = useCallback(async () => {
    if (isCapturingRef.current || isUploading) return;
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) return;
    isCapturingRef.current = true;
    try {
      lastCaptureAtRef.current = window.performance.now();
      handleCapturedFile(
        await captureVideoFrame(
          video,
          canvasRef.current,
          step,
          visibleCaptureRect(video.videoWidth, video.videoHeight),
        ),
      );
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      setErrorMessage('촬영에 실패했습니다. 다시 시도해주세요');
    } finally {
      isCapturingRef.current = false;
    }
  }, [handleCapturedFile, isUploading, step]);

  useEffect(() => {
    if (!isCameraReady || isUploading) return undefined;
    const interval = window.setInterval(() => {
      if (isCapturingRef.current) return;
      if (isDetectingRef.current) return;
      const now = window.performance.now();
      if (now < detectionPausedUntilRef.current) {
        stableDetectionCountRef.current = 0;
        lastDetectionBoxRef.current = null;
        smoothedBoxRef.current = null;
        missCountRef.current = 0;
        setIsCardDetected(false);
        setDetectionBox(null);
        return;
      }
      if (now - lastCaptureAtRef.current < DETECTION_COOLDOWN_MS) return;

      isDetectingRef.current = true;
      void detectVisibleBusinessCard(videoRef.current, canvasRef.current)
        .then((detection) => {
          if (!isMountedRef.current) return;

          if (!detection.detected || !detection.box) {
            missCountRef.current += 1;
            // 모션 블러 등으로 한두 프레임 놓친 경우 마지막 박스를 유지한다
            if (missCountRef.current <= DETECTION_MISS_TOLERANCE) return;
            stableDetectionCountRef.current = 0;
            lastDetectionBoxRef.current = null;
            smoothedBoxRef.current = null;
            setIsCardDetected(false);
            setDetectionBox(null);
            return;
          }

          missCountRef.current = 0;
          const boxIsStable =
            lastDetectionBoxRef.current &&
            boxesAreSimilar(detection.box, lastDetectionBoxRef.current);
          stableDetectionCountRef.current =
            stableDetectionCountRef.current === 0 || boxIsStable
              ? stableDetectionCountRef.current + 1
              : 1;
          lastDetectionBoxRef.current = detection.box;
          const smoothed = smoothDetectionBox(
            smoothedBoxRef.current,
            detection.box,
            DETECTION_SMOOTHING,
          );
          smoothedBoxRef.current = smoothed;
          const shouldCapture =
            stableDetectionCountRef.current >= REQUIRED_STABLE_DETECTIONS;
          setIsCardDetected(true);
          setDetectionBox(smoothed);

          if (shouldCapture) {
            stableDetectionCountRef.current = 0;
            lastCaptureAtRef.current = now;
            void captureCurrentStep();
          }
        })
        .catch(() => {
          missCountRef.current += 1;
        })
        .finally(() => {
          isDetectingRef.current = false;
        });
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
        {detectionBox && !isPreparingNextSide ? (
          <S.DetectionPolygon
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <S.DetectionShape points={toSvgPoints(detectionBox.points)} />
            {detectionBox.points.map((point, index) => (
              <S.DetectionCorner
                key={`corner-${index}`}
                cx={point.x}
                cy={point.y}
                r="2"
              />
            ))}
          </S.DetectionPolygon>
        ) : null}
        {isPreparingNextSide ? (
          <S.StepNotice role="status" aria-live="polite">
            <S.StepNoticeTitle>앞면 촬영 완료</S.StepNoticeTitle>
            <S.StepNoticeText>명함을 뒤집어 뒷면을 보여주세요</S.StepNoticeText>
          </S.StepNotice>
        ) : null}
        <S.ShutterButton
          type="button"
          aria-label="직접 촬영"
          disabled={!isCameraReady || isUploading || isPreparingNextSide}
          onClick={() => {
            void captureManually();
          }}
        />
      </S.CameraArea>
      <S.Hint>
        {isUploading
          ? '명함 정보를 불러오는 중입니다'
          : isPreparingNextSide
            ? '이제 뒷면을 프레임 안에 맞춰주세요'
            : `${step === 'front' ? '앞면' : '뒷면'}을 프레임 안에 맞추면 자동으로 촬영돼요`}
      </S.Hint>
      <S.StatusText $active={isCardDetected}>
        {isPreparingNextSide
          ? '뒷면 촬영을 준비 중'
          : isCardDetected
            ? '명함을 인식했어요'
            : '명함을 찾는 중'}
      </S.StatusText>
      {errorMessage ? <S.ErrorText>{errorMessage}</S.ErrorText> : null}
      <S.HiddenCanvas ref={canvasRef} aria-hidden="true" />
    </S.Wrapper>
  );
}

async function captureVideoFrame(
  video: HTMLVideoElement | null,
  canvas: HTMLCanvasElement | null,
  step: ScanStep,
  captureRect: CaptureRect,
): Promise<File> {
  if (!video || !canvas || video.videoWidth === 0 || video.videoHeight === 0) {
    throw new Error('Camera is not ready');
  }
  const source = clampCaptureRect(captureRect, video.videoWidth, video.videoHeight);
  canvas.width = Math.max(1, Math.round(source.width));
  canvas.height = Math.max(1, Math.round(source.height));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas context is not available');
  context.drawImage(
    video,
    source.left,
    source.top,
    source.width,
    source.height,
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

function clampCaptureRect(
  rect: CaptureRect,
  videoWidth: number,
  videoHeight: number,
): CaptureRect {
  const paddingX = Math.max(rect.width * 0.36, videoWidth * 0.07);
  const paddingY = Math.max(rect.height * 0.36, videoHeight * 0.07);
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const targetWidth = Math.max(rect.width + paddingX * 2, videoWidth * 0.72);
  const targetHeight = Math.max(rect.height + paddingY * 2, videoHeight * 0.52);
  const width = Math.min(targetWidth, videoWidth);
  const height = Math.min(targetHeight, videoHeight);
  const left = Math.min(Math.max(0, centerX - width / 2), videoWidth - width);
  const top = Math.min(Math.max(0, centerY - height / 2), videoHeight - height);
  return {
    left,
    top,
    width: Math.max(1, width),
    height: Math.max(1, height),
  };
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
