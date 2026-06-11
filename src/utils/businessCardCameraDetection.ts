import {
  type BusinessCardCandidateBox,
  type BusinessCardCandidatePoint,
} from './businessCardDetection';
import { detectCardBoxWithOpenCv } from './businessCardOpenCvDetection';

export interface DetectionOverlayBox {
  readonly points: readonly OverlayPoint[];
  readonly bounds: OverlayBounds;
  readonly captureRect: CaptureRect;
}

export interface OverlayPoint {
  readonly x: number;
  readonly y: number;
}

export interface OverlayBounds {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

export type CaptureRect = OverlayBounds;

const CAMERA_VIEW_ASPECT = 343 / 244;
const DETECTION_SAMPLE_WIDTH = 320;
const DETECTION_SAMPLE_HEIGHT = 228;

export async function detectVisibleBusinessCard(
  video: HTMLVideoElement | null,
  canvas: HTMLCanvasElement | null,
): Promise<{
  readonly detected: boolean;
  readonly box: DetectionOverlayBox | null;
}> {
  const sampled = sampleVisibleFrame(video, canvas);
  if (!sampled) return { detected: false, box: null };

  const openCvBox = await detectCardBoxWithOpenCv(sampled.imageData).catch(
    () => null,
  );

  return {
    detected: openCvBox !== null,
    box: openCvBox ? toDetectionOverlayBox(openCvBox, sampled.source) : null,
  };
}

export function visibleCaptureRect(
  videoWidth: number,
  videoHeight: number,
): CaptureRect {
  const sourceAspect = videoWidth / videoHeight;
  const widthFraction =
    sourceAspect > CAMERA_VIEW_ASPECT ? CAMERA_VIEW_ASPECT / sourceAspect : 1;
  const heightFraction =
    sourceAspect > CAMERA_VIEW_ASPECT ? 1 : sourceAspect / CAMERA_VIEW_ASPECT;
  const width = videoWidth * widthFraction;
  const height = videoHeight * heightFraction;
  return {
    left: (videoWidth - width) / 2,
    top: (videoHeight - height) / 2,
    width,
    height,
  };
}

export function boxesAreSimilar(
  current: DetectionOverlayBox,
  previous: DetectionOverlayBox,
): boolean {
  const centerDistance = Math.hypot(
    current.bounds.left + current.bounds.width / 2 -
      (previous.bounds.left + previous.bounds.width / 2),
    current.bounds.top + current.bounds.height / 2 -
      (previous.bounds.top + previous.bounds.height / 2),
  );
  const widthDelta = Math.abs(current.bounds.width - previous.bounds.width);
  const heightDelta = Math.abs(current.bounds.height - previous.bounds.height);
  return centerDistance <= 14 && widthDelta <= 16 && heightDelta <= 14;
}

export function smoothDetectionBox(
  previous: DetectionOverlayBox | null,
  next: DetectionOverlayBox,
  factor: number,
): DetectionOverlayBox {
  if (!previous || previous.points.length !== next.points.length) return next;
  const points = next.points.map((point, index) => {
    const before = previous.points[index] ?? point;
    return {
      x: lerp(before.x, point.x, factor),
      y: lerp(before.y, point.y, factor),
    };
  });
  return {
    points,
    bounds: boundsFromPoints(points),
    captureRect: {
      left: lerp(previous.captureRect.left, next.captureRect.left, factor),
      top: lerp(previous.captureRect.top, next.captureRect.top, factor),
      width: lerp(previous.captureRect.width, next.captureRect.width, factor),
      height: lerp(previous.captureRect.height, next.captureRect.height, factor),
    },
  };
}

export function toSvgPoints(points: readonly OverlayPoint[]): string {
  return points.map((point) => `${point.x},${point.y}`).join(' ');
}

function sampleVisibleFrame(
  video: HTMLVideoElement | null,
  canvas: HTMLCanvasElement | null,
): {
  readonly imageData: ImageData;
  readonly source: {
    readonly sourceX: number;
    readonly sourceY: number;
    readonly sourceWidth: number;
    readonly sourceHeight: number;
  };
} | null {
  if (!video || !canvas || video.videoWidth === 0 || video.videoHeight === 0) {
    return null;
  }

  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return null;

  const visible = visibleCaptureRect(video.videoWidth, video.videoHeight);
  canvas.width = DETECTION_SAMPLE_WIDTH;
  canvas.height = DETECTION_SAMPLE_HEIGHT;
  context.drawImage(
    video,
    visible.left,
    visible.top,
    visible.width,
    visible.height,
    0,
    0,
    DETECTION_SAMPLE_WIDTH,
    DETECTION_SAMPLE_HEIGHT,
  );

  return {
    imageData: context.getImageData(0, 0, DETECTION_SAMPLE_WIDTH, DETECTION_SAMPLE_HEIGHT),
    source: {
      sourceX: visible.left,
      sourceY: visible.top,
      sourceWidth: visible.width,
      sourceHeight: visible.height,
    },
  };
}

function toDetectionOverlayBox(
  box: BusinessCardCandidateBox,
  source: {
    readonly sourceX: number;
    readonly sourceY: number;
    readonly sourceWidth: number;
    readonly sourceHeight: number;
  },
): DetectionOverlayBox {
  const points = box.corners.map((point) => ({
    x: point.x * 100,
    y: point.y * 100,
  }));
  const rawBounds = boundsFromPoints(points);
  const pointsForDisplay = shouldUseRectangleFallback(points, rawBounds)
    ? rectanglePoints(rawBounds)
    : points;
  const bounds = boundsFromPoints(pointsForDisplay);
  const sampleBounds = boundsFromPoints(
    pointsForDisplay === points
      ? box.corners
      : rectanglePoints({
        left: box.x,
        top: box.y,
        width: box.width,
        height: box.height,
      }),
  );

  return {
    points: pointsForDisplay,
    bounds,
    captureRect: {
      left: source.sourceX + sampleBounds.left * source.sourceWidth,
      top: source.sourceY + sampleBounds.top * source.sourceHeight,
      width: sampleBounds.width * source.sourceWidth,
      height: sampleBounds.height * source.sourceHeight,
    },
  };
}

function boundsFromPoints(
  points: readonly OverlayPoint[] | readonly BusinessCardCandidatePoint[],
): OverlayBounds {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const left = Math.min(...xs);
  const right = Math.max(...xs);
  const top = Math.min(...ys);
  const bottom = Math.max(...ys);
  return {
    left,
    top,
    width: right - left,
    height: bottom - top,
  };
}

function shouldUseRectangleFallback(
  points: readonly OverlayPoint[],
  bounds: OverlayBounds,
): boolean {
  if (bounds.width < 28 || bounds.height < 18) return true;
  const boundsArea = bounds.width * bounds.height;
  if (boundsArea <= 0) return true;
  const polygonArea = Math.abs(
    points.reduce((total, point, index) => {
      const next = points[(index + 1) % points.length] ?? points[0];
      return total + point.x * next.y - next.x * point.y;
    }, 0) / 2,
  );
  return polygonArea / boundsArea < 0.42;
}

function rectanglePoints(bounds: OverlayBounds): readonly OverlayPoint[] {
  const right = bounds.left + bounds.width;
  const bottom = bounds.top + bounds.height;
  return [
    { x: bounds.left, y: bounds.top },
    { x: right, y: bounds.top },
    { x: right, y: bottom },
    { x: bounds.left, y: bottom },
  ];
}

function lerp(from: number, to: number, factor: number): number {
  return from + (to - from) * factor;
}
