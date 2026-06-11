export interface BusinessCardDetectionMetrics {
  readonly brightRatio: number;
  readonly darkRatio: number;
  readonly edgeRatio: number;
  readonly centerBorderContrast: number;
  readonly centerDarkRatio: number;
  readonly centerBrightRatio: number;
  readonly luminanceAverage: number;
  readonly luminanceStdDev: number;
}

export interface BusinessCardCandidateBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly score: number;
  readonly corners: readonly BusinessCardCandidatePoint[];
}

export interface BusinessCardCandidatePoint {
  readonly x: number;
  readonly y: number;
}

export interface BusinessCardDetectionResult {
  readonly detected: boolean;
  readonly metrics: BusinessCardDetectionMetrics;
  readonly box: BusinessCardCandidateBox | null;
}

const LUMA_RED = 0.299;
const LUMA_GREEN = 0.587;
const LUMA_BLUE = 0.114;
const DARK_LUMINANCE = 96;
const BRIGHT_LUMINANCE = 150;
const MIN_EDGE_RATIO = 0.008;
const MIN_STD_DEV = 10;
const MIN_CENTER_BORDER_CONTRAST = 12;
const MIN_BOX_SCORE = 0.6;

export function detectBusinessCardFromImageData(
  imageData: ImageData,
): BusinessCardDetectionResult {
  const luminance = readLuminance(imageData);
  const metrics = calculateMetrics(luminance, imageData.width, imageData.height);
  const box = findCardCandidateBox(luminance, imageData.width, imageData.height);
  const hasDarkCard =
    metrics.centerDarkRatio >= 0.2 &&
    metrics.luminanceStdDev >= MIN_STD_DEV &&
    metrics.edgeRatio >= MIN_EDGE_RATIO &&
    (metrics.centerBorderContrast >= MIN_CENTER_BORDER_CONTRAST ||
      metrics.darkRatio >= 0.26);
  const hasBrightCard =
    metrics.centerBrightRatio >= 0.3 &&
    metrics.luminanceStdDev >= MIN_STD_DEV &&
    metrics.edgeRatio >= MIN_EDGE_RATIO &&
    (metrics.centerBorderContrast >= MIN_CENTER_BORDER_CONTRAST ||
      metrics.brightRatio >= 0.36);
  const hasCenteredCard =
    metrics.centerBorderContrast >= MIN_CENTER_BORDER_CONTRAST &&
    metrics.edgeRatio >= MIN_EDGE_RATIO &&
    (metrics.centerDarkRatio >= 0.2 || metrics.centerBrightRatio >= 0.3);

  return {
    detected:
      box !== null &&
      box.score >= MIN_BOX_SCORE &&
      (hasDarkCard ||
        hasBrightCard ||
        hasCenteredCard),
    metrics,
    box,
  };
}

function readLuminance(imageData: ImageData): readonly number[] {
  const luminance: number[] = [];
  const { data } = imageData;
  for (let index = 0; index < data.length; index += 4) {
    const red = data[index] ?? 0;
    const green = data[index + 1] ?? 0;
    const blue = data[index + 2] ?? 0;
    luminance.push(red * LUMA_RED + green * LUMA_GREEN + blue * LUMA_BLUE);
  }
  return luminance;
}

function calculateMetrics(
  luminance: readonly number[],
  width: number,
  height: number,
): BusinessCardDetectionMetrics {
  const sampleCount = Math.max(luminance.length, 1);
  let brightCount = 0;
  let darkCount = 0;
  let total = 0;
  for (const value of luminance) {
    total += value;
    if (value <= DARK_LUMINANCE) darkCount += 1;
    if (value >= BRIGHT_LUMINANCE) brightCount += 1;
  }

  const average = total / sampleCount;
  let varianceTotal = 0;
  for (const value of luminance) {
    varianceTotal += (value - average) ** 2;
  }

  const regionMetrics = calculateRegionMetrics(luminance, width, height);

  return {
    brightRatio: brightCount / sampleCount,
    darkRatio: darkCount / sampleCount,
    edgeRatio: calculateEdgeRatio(luminance, width, height),
    centerBorderContrast: Math.abs(regionMetrics.centerAverage - regionMetrics.borderAverage),
    centerDarkRatio: regionMetrics.centerDarkRatio,
    centerBrightRatio: regionMetrics.centerBrightRatio,
    luminanceAverage: average,
    luminanceStdDev: Math.sqrt(varianceTotal / sampleCount),
  };
}

function calculateRegionMetrics(
  luminance: readonly number[],
  width: number,
  height: number,
): {
  readonly borderAverage: number;
  readonly centerAverage: number;
  readonly centerBrightRatio: number;
  readonly centerDarkRatio: number;
} {
  let centerTotal = 0;
  let centerCount = 0;
  let centerBrightCount = 0;
  let centerDarkCount = 0;
  let borderTotal = 0;
  let borderCount = 0;

  const centerLeft = Math.floor(width * 0.18);
  const centerRight = Math.ceil(width * 0.82);
  const centerTop = Math.floor(height * 0.18);
  const centerBottom = Math.ceil(height * 0.82);
  const borderSizeX = Math.max(1, Math.floor(width * 0.12));
  const borderSizeY = Math.max(1, Math.floor(height * 0.12));

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const value = luminance[y * width + x] ?? 0;
      const isCenter =
        x >= centerLeft &&
        x < centerRight &&
        y >= centerTop &&
        y < centerBottom;
      if (isCenter) {
        centerTotal += value;
        centerCount += 1;
        if (value <= DARK_LUMINANCE) centerDarkCount += 1;
        if (value >= BRIGHT_LUMINANCE) centerBrightCount += 1;
        continue;
      }

      const isBorder =
        x < borderSizeX ||
        x >= width - borderSizeX ||
        y < borderSizeY ||
        y >= height - borderSizeY;
      if (isBorder) {
        borderTotal += value;
        borderCount += 1;
      }
    }
  }

  return {
    borderAverage: borderCount === 0 ? 0 : borderTotal / borderCount,
    centerAverage: centerCount === 0 ? 0 : centerTotal / centerCount,
    centerBrightRatio: centerCount === 0 ? 0 : centerBrightCount / centerCount,
    centerDarkRatio: centerCount === 0 ? 0 : centerDarkCount / centerCount,
  };
}

function calculateEdgeRatio(
  luminance: readonly number[],
  width: number,
  height: number,
): number {
  if (width < 3 || height < 3) return 0;

  let edgeCount = 0;
  let totalCount = 0;
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const center = luminance[y * width + x] ?? 0;
      const right = luminance[y * width + x + 1] ?? center;
      const down = luminance[(y + 1) * width + x] ?? center;
      const gradient = Math.abs(center - right) + Math.abs(center - down);
      if (gradient >= 42) edgeCount += 1;
      totalCount += 1;
    }
  }

  return totalCount === 0 ? 0 : edgeCount / totalCount;
}

function findCardCandidateBox(
  luminance: readonly number[],
  width: number,
  height: number,
): BusinessCardCandidateBox | null {
  if (width < 20 || height < 20) return null;

  // 밝은 후보(흰 명함)와 어두운 후보(검은 명함)를 별도 마스크로 분리한다.
  // 테두리 평균과의 '차이'를 쓰면 밝은 영역과 어두운 영역이 한 덩어리로
  // 이어져 프레임 전체가 하나의 컴포넌트가 되어 버린다.
  const borderAverage = calculateBorderAverage(luminance, width, height);
  const brightThreshold = Math.max(150, borderAverage + 35);
  const darkThreshold = Math.min(90, borderAverage - 35);
  const brightBest = bestComponentForMask(
    luminance,
    width,
    height,
    (value) => value >= brightThreshold,
  );
  const darkBest = bestComponentForMask(
    luminance,
    width,
    height,
    (value) => value <= darkThreshold,
  );

  if (brightBest && darkBest) {
    return brightBest.score >= darkBest.score ? brightBest : darkBest;
  }
  return brightBest ?? darkBest;
}

function bestComponentForMask(
  luminance: readonly number[],
  width: number,
  height: number,
  includeValue: (value: number) => boolean,
): BusinessCardCandidateBox | null {
  const mask = new Uint8Array(width * height);
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = y * width + x;
      if (includeValue(luminance[index] ?? 0)) {
        mask[index] = 1;
      }
    }
  }

  const visited = new Uint8Array(width * height);
  let best: BusinessCardCandidateBox | null = null;

  for (let index = 0; index < mask.length; index += 1) {
    if (mask[index] === 0 || visited[index] === 1) continue;
    const component = collectComponent(mask, visited, width, height, index);
    const box = scoreComponent(component, width, height);
    if (!box) continue;
    if (!best || box.score > best.score) {
      best = box;
    }
  }

  return best;
}

function calculateBorderAverage(
  luminance: readonly number[],
  width: number,
  height: number,
): number {
  const borderSizeX = Math.max(2, Math.floor(width * 0.08));
  const borderSizeY = Math.max(2, Math.floor(height * 0.08));
  let total = 0;
  let count = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const isBorder =
        x < borderSizeX ||
        x >= width - borderSizeX ||
        y < borderSizeY ||
        y >= height - borderSizeY;
      if (!isBorder) continue;
      total += luminance[y * width + x] ?? 0;
      count += 1;
    }
  }

  return count === 0 ? 0 : total / count;
}

interface ComponentBounds {
  readonly minX: number;
  readonly maxX: number;
  readonly minY: number;
  readonly maxY: number;
  readonly pixelCount: number;
  readonly topLeft: ComponentPoint;
  readonly topRight: ComponentPoint;
  readonly bottomRight: ComponentPoint;
  readonly bottomLeft: ComponentPoint;
}

interface ComponentPoint {
  readonly x: number;
  readonly y: number;
}

function collectComponent(
  mask: Uint8Array,
  visited: Uint8Array,
  width: number,
  height: number,
  startIndex: number,
): ComponentBounds {
  const stack = [startIndex];
  visited[startIndex] = 1;
  let minX = width;
  let maxX = 0;
  let minY = height;
  let maxY = 0;
  let pixelCount = 0;
  let topLeft: ComponentPoint = { x: width, y: height };
  let topRight: ComponentPoint = { x: 0, y: height };
  let bottomRight: ComponentPoint = { x: 0, y: 0 };
  let bottomLeft: ComponentPoint = { x: width, y: 0 };
  let topLeftScore = Number.POSITIVE_INFINITY;
  let topRightScore = Number.NEGATIVE_INFINITY;
  let bottomRightScore = Number.NEGATIVE_INFINITY;
  let bottomLeftScore = Number.NEGATIVE_INFINITY;

  while (stack.length > 0) {
    const index = stack.pop();
    if (index === undefined) break;
    const x = index % width;
    const y = Math.floor(index / width);
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
    pixelCount += 1;

    const tlScore = x + y;
    const trScore = x - y;
    const brScore = x + y;
    const blScore = y - x;
    if (tlScore < topLeftScore) {
      topLeftScore = tlScore;
      topLeft = { x, y };
    }
    if (trScore > topRightScore) {
      topRightScore = trScore;
      topRight = { x, y };
    }
    if (brScore > bottomRightScore) {
      bottomRightScore = brScore;
      bottomRight = { x, y };
    }
    if (blScore > bottomLeftScore) {
      bottomLeftScore = blScore;
      bottomLeft = { x, y };
    }

    if (x > 0) pushNeighbor(mask, visited, stack, index - 1);
    if (x < width - 1) pushNeighbor(mask, visited, stack, index + 1);
    if (y > 0) pushNeighbor(mask, visited, stack, index - width);
    if (y < height - 1) pushNeighbor(mask, visited, stack, index + width);
  }

  return {
    minX,
    maxX,
    minY,
    maxY,
    pixelCount,
    topLeft,
    topRight,
    bottomRight,
    bottomLeft,
  };
}

function pushNeighbor(
  mask: Uint8Array,
  visited: Uint8Array,
  stack: number[],
  index: number,
): void {
  if (mask[index] === 0 || visited[index] === 1) return;
  visited[index] = 1;
  stack.push(index);
}

function scoreComponent(
  component: ComponentBounds,
  width: number,
  height: number,
): BusinessCardCandidateBox | null {
  const boxWidth = component.maxX - component.minX + 1;
  const boxHeight = component.maxY - component.minY + 1;
  const areaRatio = (boxWidth * boxHeight) / (width * height);
  const fillRatio = component.pixelCount / Math.max(boxWidth * boxHeight, 1);
  const aspectRatio = boxWidth / Math.max(boxHeight, 1);
  const centerX = (component.minX + component.maxX) / 2 / width;
  const centerY = (component.minY + component.maxY) / 2 / height;
  const centerDistance = Math.hypot(centerX - 0.5, centerY - 0.5);

  // 4개 극점이 이루는 사각형 면적과 실제 픽셀 수의 비율.
  // 회전한 직사각형(명함)은 ~1.0, 타원(얼굴 등) ~0.64, 불규칙 덩어리는 크게 벗어난다.
  const quadArea = polygonArea([
    component.topLeft,
    component.topRight,
    component.bottomRight,
    component.bottomLeft,
  ]);
  const quadFit = quadArea / Math.max(component.pixelCount, 1);

  if (areaRatio < 0.12 || areaRatio > 0.8) return null;
  if (aspectRatio < 1.18 || aspectRatio > 2.9) return null;
  if (fillRatio < 0.3) return null;
  if (centerDistance > 0.34) return null;
  if (quadFit < 0.7 || quadFit > 2) return null;

  const aspectScore = 1 - Math.min(Math.abs(aspectRatio - 1.55) / 0.9, 1);
  const areaScore = areaRatio >= 0.2 && areaRatio <= 0.7 ? 1 : 0.7;
  const fillScore = Math.min(fillRatio / 0.5, 1);
  const centerScore = 1 - Math.min(centerDistance / 0.34, 1);
  const quadScore = 1 - Math.min(Math.abs(quadFit - 1), 1);
  const score =
    aspectScore * 0.26 +
    areaScore * 0.16 +
    fillScore * 0.18 +
    centerScore * 0.2 +
    quadScore * 0.2;

  return {
    x: component.minX / width,
    y: component.minY / height,
    width: boxWidth / width,
    height: boxHeight / height,
    score,
    corners: [
      normalizePoint(component.topLeft, width, height),
      normalizePoint(component.topRight, width, height),
      normalizePoint(component.bottomRight, width, height),
      normalizePoint(component.bottomLeft, width, height),
    ],
  };
}

function normalizePoint(
  point: ComponentPoint,
  width: number,
  height: number,
): BusinessCardCandidatePoint {
  return {
    x: point.x / width,
    y: point.y / height,
  };
}

function polygonArea(points: readonly ComponentPoint[]): number {
  let total = 0;
  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    if (!current || !next) continue;
    total += current.x * next.y - next.x * current.y;
  }
  return Math.abs(total / 2);
}
