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

export interface BusinessCardDetectionResult {
  readonly detected: boolean;
  readonly metrics: BusinessCardDetectionMetrics;
}

const LUMA_RED = 0.299;
const LUMA_GREEN = 0.587;
const LUMA_BLUE = 0.114;
const DARK_LUMINANCE = 96;
const BRIGHT_LUMINANCE = 150;
const MIN_EDGE_RATIO = 0.01;
const MIN_STD_DEV = 8;
const MIN_CENTER_BORDER_CONTRAST = 10;

export function detectBusinessCardFromImageData(
  imageData: ImageData,
): BusinessCardDetectionResult {
  const luminance = readLuminance(imageData);
  const metrics = calculateMetrics(luminance, imageData.width, imageData.height);
  const hasReadableSurface =
    metrics.luminanceStdDev >= MIN_STD_DEV &&
    metrics.edgeRatio >= MIN_EDGE_RATIO;
  const hasDarkCard =
    metrics.darkRatio >= 0.18 &&
    metrics.luminanceStdDev >= MIN_STD_DEV &&
    (metrics.edgeRatio >= 0.008 ||
      metrics.centerBorderContrast >= MIN_CENTER_BORDER_CONTRAST);
  const hasBrightCard =
    metrics.brightRatio >= 0.32 &&
    metrics.luminanceStdDev >= MIN_STD_DEV &&
    (metrics.edgeRatio >= 0.008 ||
      metrics.centerBorderContrast >= MIN_CENTER_BORDER_CONTRAST);
  const hasCenteredCard =
    metrics.centerBorderContrast >= MIN_CENTER_BORDER_CONTRAST &&
    (metrics.centerDarkRatio >= 0.16 || metrics.centerBrightRatio >= 0.2);

  return {
    detected:
      hasReadableSurface ||
      hasDarkCard ||
      hasBrightCard ||
      hasCenteredCard,
    metrics,
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
