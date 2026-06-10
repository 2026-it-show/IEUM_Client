export interface BusinessCardDetectionMetrics {
  readonly brightRatio: number;
  readonly edgeRatio: number;
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
const BRIGHT_LUMINANCE = 142;
const MIN_BRIGHT_RATIO = 0.48;
const MIN_EDGE_RATIO = 0.035;
const MIN_STD_DEV = 18;

export function detectBusinessCardFromImageData(
  imageData: ImageData,
): BusinessCardDetectionResult {
  const luminance = readLuminance(imageData);
  const metrics = calculateMetrics(luminance, imageData.width, imageData.height);
  return {
    detected:
      metrics.brightRatio >= MIN_BRIGHT_RATIO &&
      metrics.edgeRatio >= MIN_EDGE_RATIO &&
      metrics.luminanceStdDev >= MIN_STD_DEV,
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
  let total = 0;
  for (const value of luminance) {
    total += value;
    if (value >= BRIGHT_LUMINANCE) brightCount += 1;
  }

  const average = total / sampleCount;
  let varianceTotal = 0;
  for (const value of luminance) {
    varianceTotal += (value - average) ** 2;
  }

  return {
    brightRatio: brightCount / sampleCount,
    edgeRatio: calculateEdgeRatio(luminance, width, height),
    luminanceAverage: average,
    luminanceStdDev: Math.sqrt(varianceTotal / sampleCount),
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
