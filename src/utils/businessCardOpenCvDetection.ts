import cvRuntime from '@techstark/opencv-js';
import type {
  BusinessCardCandidateBox,
  BusinessCardCandidatePoint,
} from './businessCardDetection';

interface OpenCvCandidate {
  readonly box: BusinessCardCandidateBox;
  readonly score: number;
}

type OpenCvRuntime = typeof import('@techstark/opencv-js');
type OpenCvRuntimeModule = OpenCvRuntime & {
  readonly then?: (onReady: (ready: OpenCvRuntime) => void) => unknown;
};

const MIN_OPENCV_SCORE = 0.68;

let openCvReady: Promise<OpenCvRuntime> | null = null;

export async function detectCardBoxWithOpenCv(
  imageData: ImageData,
): Promise<BusinessCardCandidateBox | null> {
  const cv = await getOpenCv();
  const src = cv.matFromImageData(imageData);
  const gray = new cv.Mat();
  const blurred = new cv.Mat();
  const edges = new cv.Mat();
  const closed = new cv.Mat();
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();
  const kernel = cv.Mat.ones(3, 3, cv.CV_8U);

  try {
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
    cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);
    cv.Canny(blurred, edges, 45, 135);
    cv.dilate(edges, closed, kernel);
    cv.findContours(
      closed,
      contours,
      hierarchy,
      cv.RETR_EXTERNAL,
      cv.CHAIN_APPROX_SIMPLE,
    );
    return findBestOpenCvContour(cv, contours, imageData.width, imageData.height);
  } finally {
    src.delete();
    gray.delete();
    blurred.delete();
    edges.delete();
    closed.delete();
    contours.delete();
    hierarchy.delete();
    kernel.delete();
  }
}

function findBestOpenCvContour(
  cv: OpenCvRuntime,
  contours: InstanceType<OpenCvRuntime['MatVector']>,
  width: number,
  height: number,
): BusinessCardCandidateBox | null {
  let best: OpenCvCandidate | null = null;
  for (let index = 0; index < contours.size(); index += 1) {
    const contour = contours.get(index);
    const approx = new cv.Mat();
    try {
      const perimeter = cv.arcLength(contour, true);
      cv.approxPolyDP(contour, approx, perimeter * 0.035, true);
      const candidate = scoreOpenCvContour(cv, approx, width, height);
      if (candidate && (!best || candidate.score > best.score)) {
        best = candidate;
      }
    } finally {
      contour.delete();
      approx.delete();
    }
  }
  return best && best.score >= MIN_OPENCV_SCORE ? best.box : null;
}

function scoreOpenCvContour(
  cv: OpenCvRuntime,
  contour: InstanceType<OpenCvRuntime['Mat']>,
  width: number,
  height: number,
): OpenCvCandidate | null {
  if (contour.rows !== 4 || !cv.isContourConvex(contour)) return null;

  const rect = cv.boundingRect(contour);
  const area = Math.abs(cv.contourArea(contour));
  const areaRatio = area / (width * height);
  const shortSide = Math.max(Math.min(rect.width, rect.height), 1);
  const aspectRatio = Math.max(rect.width, rect.height) / shortSide;
  const extent = area / Math.max(rect.width * rect.height, 1);
  const centerDistance = Math.hypot(
    (rect.x + rect.width / 2) / width - 0.5,
    (rect.y + rect.height / 2) / height - 0.5,
  );

  if (areaRatio < 0.16 || areaRatio > 0.76) return null;
  if (aspectRatio < 1.22 || aspectRatio > 2.35) return null;
  if (extent < 0.66) return null;
  if (centerDistance > 0.3) return null;

  const points = readContourPoints(contour, width, height);
  if (!points) return null;

  const aspectScore = 1 - Math.min(Math.abs(aspectRatio - 1.6) / 0.75, 1);
  const areaScore = areaRatio >= 0.22 && areaRatio <= 0.68 ? 1 : 0.72;
  const extentScore = Math.min(extent / 0.82, 1);
  const centerScore = 1 - Math.min(centerDistance / 0.3, 1);
  const score =
    aspectScore * 0.32 +
    areaScore * 0.22 +
    extentScore * 0.24 +
    centerScore * 0.22;

  return {
    score,
    box: {
      x: rect.x / width,
      y: rect.y / height,
      width: rect.width / width,
      height: rect.height / height,
      score,
      corners: orderPoints(points),
    },
  };
}

function readContourPoints(
  contour: InstanceType<OpenCvRuntime['Mat']>,
  width: number,
  height: number,
): readonly BusinessCardCandidatePoint[] | null {
  const points: BusinessCardCandidatePoint[] = [];
  for (let index = 0; index < contour.data32S.length; index += 2) {
    const x = contour.data32S[index];
    const y = contour.data32S[index + 1];
    if (x === undefined || y === undefined) return null;
    points.push({ x: x / width, y: y / height });
  }
  return points.length === 4 ? points : null;
}

function orderPoints(
  points: readonly BusinessCardCandidatePoint[],
): readonly BusinessCardCandidatePoint[] {
  return [...points].sort((first, second) => {
    const firstAngle = Math.atan2(first.y - 0.5, first.x - 0.5);
    const secondAngle = Math.atan2(second.y - 0.5, second.x - 0.5);
    return firstAngle - secondAngle;
  });
}

function getOpenCv(): Promise<OpenCvRuntime> {
  if (!openCvReady) {
    const runtime = cvRuntime as OpenCvRuntimeModule;
    openCvReady = new Promise((resolve) => {
      const maybePromise = runtime.then?.((ready) => resolve(ready));
      if (!maybePromise && typeof runtime.Mat === 'function') {
        resolve(runtime);
      }
    });
  }
  return openCvReady;
}
