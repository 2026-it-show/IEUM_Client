import type { ExperienceCategoryId } from './types';

export interface Booth {
  id: string;
  /** Booth code label ("A1", "B-2", ...) shown by default. */
  title: string;
  /** Service name shown when the map is zoomed in. Empty for aux. */
  serviceName: string;
  categoryId: ExperienceCategoryId;
  color: string;
  /** Center coordinates as a fraction of the map width/height (0~1). */
  x: number;
  y: number;
  /** Tile width/height as a fraction of the map width/height (0~1). */
  w: number;
  h: number;
  /** Auxiliary / connector booth (dashed codes like "A-2"). */
  aux?: boolean;
  /**
   * Vertical nudge of the LABEL ONLY (CSS px). Lets adjacent booths
   * stay in a single row while their labels alternate up/down to avoid
   * overlap (used by the E-row).
   */
  labelOffsetY?: number;
}

/**
 * The map is rendered at a fixed natural size. Booth dimensions are
 * defined in absolute pixels, the positions below as fractions of the
 * natural map. Tightening MAP_W brings the columns horizontally closer
 * together (user requested less white space) without changing the booth
 * size itself.
 *
 *   main "V"     – 23 × 28 px (most booths)
 *   long  "LV"  – 11 × 36 px (long verticals  : A-1, A-3, B-3, …)
 *   long  "LH"  – 36 × 11 px (long horizontals: B-1, C-1, D-1, F-5, …)
 *
 * A 1-px gap is always preserved between adjacent booths inside the same
 * cluster (see `STEP_*` below).
 */
export const MAP_W = 590;
export const MAP_H = 1024;

const V = { w: 23 / MAP_W, h: 28 / MAP_H }; // 23×28 main
const LV = { w: 11 / MAP_W, h: 36 / MAP_H }; // 11×36 long vertical
const LH = { w: 36 / MAP_W, h: 11 / MAP_H }; // 36×11 long horizontal

// Centre-to-centre step with a 1-px gap:
const STEP_V_Y = (28 + 1) / MAP_H; // main column vertical step
const STEP_LV_Y = (36 + 1) / MAP_H; // long-vertical stack step
const STEP_LH_X = (36 + 1) / MAP_W; // long-horizontal row step

const COLOR = {
  global: '#D88E70',
  ai: '#2B92D0',
  human: '#F399BE',
  network: '#F4827E',
  personal: '#23B575',
  creative: '#F9C96B',
  journey: '#B68FCF',
} as const;

const main = (
  id: string,
  categoryId: ExperienceCategoryId,
  x: number,
  y: number,
  serviceName: string,
  size: Pick<Booth, 'w' | 'h'> = V,
  labelOffsetY?: number,
): Booth => ({
  id,
  title: id,
  serviceName,
  categoryId,
  color: COLOR[categoryId],
  x,
  y,
  w: size.w,
  h: size.h,
  labelOffsetY,
});

const aux = (
  id: string,
  categoryId: ExperienceCategoryId,
  x: number,
  y: number,
  size: Pick<Booth, 'w' | 'h'> = LV,
): Booth => ({
  id,
  title: id,
  serviceName: '',
  categoryId,
  color: COLOR[categoryId],
  x,
  y,
  w: size.w,
  h: size.h,
  aux: true,
});

// Helper: generates [n] vertically-stacked booth centres starting at topY
const stackY = (topY: number, n: number, step: number): number[] =>
  Array.from({ length: n }, (_, i) => topY + i * step);

// Helper: generates [n] horizontally-stacked booth centres
const stackX = (leftX: number, n: number, step: number): number[] =>
  Array.from({ length: n }, (_, i) => leftX + i * step);

// ── A column (AI) ─────────────────────────────────────────────────
const AX = 0.137;
const aY = stackY(0.234, 6, STEP_V_Y); // A6, A5, A4, A3, A2, A1

// A-2, A-1 cluster at top
const AAUX_TOP_X = 0.199;
const A2y = 0.103;
const A1y = A2y + STEP_LV_Y;

// A-3, A-4 cluster middle
const AAUX_MID_X = 0.295;
const A3y = 0.250;
const A4y = A3y + STEP_LV_Y;
const A5y = 0.395;

// ── B column (Human) ──────────────────────────────────────────────
const BX = 0.386;
const bY = stackY(0.264, 4, STEP_V_Y); // B4, B3, B2, B1

const B1x = 0.314;
const B2x = B1x + STEP_LH_X;
const BTOPy = 0.049;

const BAUX_X = 0.478;
const B3y = 0.232;
const B4y = B3y + STEP_LV_Y;
const B5x = 0.518;
const B5y = 0.361;

// ── C column (Network) ────────────────────────────────────────────
const CX = 0.566;
const cY = stackY(0.205, 6, STEP_V_Y); // C6 .. C1

const C1x = 0.452;
const C2x = C1x + STEP_LH_X;

const CAUX_X = 0.668;
const C3y = 0.232;
const C4y = C3y + STEP_LV_Y;
const C5x = 0.695;
const C5y = 0.363;

// ── D column (Personal) ───────────────────────────────────────────
const DX = 0.723;
const dY = stackY(0.208, 6, STEP_V_Y); // D6 .. D1

const D1x = 0.622;
const D2x = D1x + STEP_LH_X;

const DAUX_X = 0.828;
const D3y = 0.130;
const D4y = D3y + STEP_LV_Y;
const D5y = D4y + STEP_LV_Y + 0.014; // small extra gap to match image

// ── E row (Creative) – horizontal row of 6 booths on ONE row.
//    The label-only zig-zag (labelOffsetY) below alternates labels above
//    /below the booth so the long service-names ("Feed or Protect" etc.)
//    never collide with neighbours – the booth boxes themselves stay
//    perfectly aligned in a single row.
const E_STEP_X = (23 + 6) / MAP_W; // slightly wider horizontal step for E row
const eY0 = 0.602; // single row y
const eX = stackX(0.585, 6, E_STEP_X);
// 3-tier label zig-zag so even same-parity booths are at different heights:
//   E1 top, E2 mid, E3 bottom, E4 top, E5 mid, E6 bottom
const E_LBL_TOP = -26;
const E_LBL_MID = 0;
const E_LBL_BOT = 26;
const eLabelOffsetY = [
  E_LBL_TOP,
  E_LBL_MID,
  E_LBL_BOT,
  E_LBL_TOP,
  E_LBL_MID,
  E_LBL_BOT,
];

const EAUX_X = 0.878; // E-1, E-2, E-3 (right side verticals)
const E1y = 0.363;
const E2y = E1y + STEP_LV_Y + 0.019;
const E3y = E2y + STEP_LV_Y + 0.031;

const E6x = 0.508;
const E6y = 0.567;
const E5x = 0.760;
const E4x = E5x + STEP_LH_X;
const E45y = 0.546;

// ── F column (Journey) ────────────────────────────────────────────
const FX = 0.708;
const fY = stackY(0.695, 6, STEP_V_Y); // F6 .. F1

const FAUX_X = 0.944;
const F1y = 0.690;
const F2y = F1y + STEP_LV_Y + 0.036;
const F3y = F2y + STEP_LV_Y + 0.036;
const F4y = F3y + STEP_LV_Y + 0.029;

const F5x = 0.862;
const F6x = F5x - STEP_LH_X;
const F56y = 0.913;

// ── G column (Global) ─────────────────────────────────────────────
const GX = 0.102;
const gY = stackY(0.518, 7, STEP_V_Y); // G7 .. G1

export const BOOTHS: Booth[] = [
  // ─── AI Experience (blue) ───────────────────────────────────────
  aux('A-2', 'ai', AAUX_TOP_X, A2y),
  aux('A-1', 'ai', AAUX_TOP_X, A1y),
  main('A6', 'ai', AX, aY[0], 'Tone-Z'),
  main('A5', 'ai', AX, aY[1], 'Mony'),
  main('A4', 'ai', AX, aY[2], '오모'),
  main('A3', 'ai', AX, aY[3], 'Reco'),
  main('A2', 'ai', AX, aY[4], '무브잇'),
  main('A1', 'ai', AX, aY[5], 'MALO'),
  aux('A-3', 'ai', AAUX_MID_X, A3y),
  aux('A-4', 'ai', AAUX_MID_X, A4y),
  aux('A-5', 'ai', AAUX_MID_X, A5y),

  // ─── Human Experience (pink) ────────────────────────────────────
  aux('B-1', 'human', B1x, BTOPy, LH),
  aux('B-2', 'human', B2x, BTOPy, LH),
  main('B4', 'human', BX, bY[0], 'MAKO'),
  main('B3', 'human', BX, bY[1], 'SafeShield'),
  main('B2', 'human', BX, bY[2], 'Dear Me;Dear You'),
  main('B1', 'human', BX, bY[3], 'Naru'),
  aux('B-3', 'human', BAUX_X, B3y),
  aux('B-4', 'human', BAUX_X, B4y),
  aux('B-5', 'human', B5x, B5y),

  // ─── Network Experience (coral) ─────────────────────────────────
  aux('C-1', 'network', C1x, BTOPy, LH),
  aux('C-2', 'network', C2x, BTOPy, LH),
  main('C6', 'network', CX, cY[0], 'OVLY'),
  main('C5', 'network', CX, cY[1], 'Star Spot'),
  main('C4', 'network', CX, cY[2], '정명'),
  main('C3', 'network', CX, cY[3], 'AdMatch'),
  main('C2', 'network', CX, cY[4], 'Survly'),
  main('C1', 'network', CX, cY[5], '이음'),
  aux('C-3', 'network', CAUX_X, C3y),
  aux('C-4', 'network', CAUX_X, C4y),
  aux('C-5', 'network', C5x, C5y),

  // ─── Personal Experience (green) ────────────────────────────────
  aux('D-1', 'personal', D1x, BTOPy, LH),
  aux('D-2', 'personal', D2x, BTOPy, LH),
  main('D6', 'personal', DX, dY[0], '이상형.zip'),
  main('D5', 'personal', DX, dY[1], 'Mikura'),
  main('D4', 'personal', DX, dY[2], 'Ribumi'),
  main('D3', 'personal', DX, dY[3], '애인 사주오!'),
  main('D2', 'personal', DX, dY[4], '더그아웃'),
  main('D1', 'personal', DX, dY[5], '모먼트인'),
  aux('D-3', 'personal', DAUX_X, D3y),
  aux('D-4', 'personal', DAUX_X, D4y),
  aux('D-5', 'personal', DAUX_X, D5y),

  // ─── Creative Experience (yellow) ───────────────────────────────
  aux('E-1', 'creative', EAUX_X, E1y),
  aux('E-2', 'creative', EAUX_X, E2y),
  aux('E-3', 'creative', EAUX_X, E3y),
  aux('E-6', 'creative', E6x, E6y, LH),
  aux('E-5', 'creative', E5x, E45y, LH),
  aux('E-4', 'creative', E4x, E45y, LH),
  main('E1', 'creative', eX[0], eY0, '쁘이', V, eLabelOffsetY[0]),
  main('E2', 'creative', eX[1], eY0, 'Feed or Protect', V, eLabelOffsetY[1]),
  main('E3', 'creative', eX[2], eY0, '세바스찬', V, eLabelOffsetY[2]),
  main('E4', 'creative', eX[3], eY0, 'Who is criminal?', V, eLabelOffsetY[3]),
  main('E5', 'creative', eX[4], eY0, '404 Not Found', V, eLabelOffsetY[4]),
  main('E6', 'creative', eX[5], eY0, 'NewbieQuest', V, eLabelOffsetY[5]),

  // ─── Journey Experience (purple) ────────────────────────────────
  main('F6', 'journey', FX, fY[0], 'Mirim OAuth'),
  main('F5', 'journey', FX, fY[1], 'Plank'),
  main('F4', 'journey', FX, fY[2], '체크잇'),
  main('F3', 'journey', FX, fY[3], 'Artifact'),
  main('F2', 'journey', FX, fY[4], '시장여지도'),
  main('F1', 'journey', FX, fY[5], 'WIP'),
  aux('F-1', 'journey', FAUX_X, F1y),
  aux('F-2', 'journey', FAUX_X, F2y),
  aux('F-3', 'journey', FAUX_X, F3y),
  aux('F-4', 'journey', FAUX_X, F4y),
  aux('F-6', 'journey', F6x, F56y, LH),
  aux('F-5', 'journey', F5x, F56y, LH),

  // ─── Global Experience (orange) ─────────────────────────────────
  main('G7', 'global', GX, gY[0], 'Mytsuri'),
  main('G6', 'global', GX, gY[1], 'PuranPuran'),
  main('G5', 'global', GX, gY[2], '토모랑'),
  main('G4', 'global', GX, gY[3], 'RooT'),
  main('G3', 'global', GX, gY[4], 'WorkIt'),
  main('G2', 'global', GX, gY[5], 'Trustay'),
  main('G1', 'global', GX, gY[6], 'Growvy'),
];

/** Empty / dashed rectangles ("storage" boxes) on the map. */
export interface EmptySlot {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Dashed empty rectangles drawn directly from the reference image.
 * Coordinates are *centres* as fractions of the 763 × 1024 map.
 */
export const EMPTY_SLOTS: EmptySlot[] = [
  // Two storage boxes between A column and Human pill (just above AI pill)
  { id: 'es-ai-l', x: 0.225, y: 0.477, w: 0.04, h: 0.038 },
  { id: 'es-ai-r', x: 0.275, y: 0.477, w: 0.04, h: 0.038 },
  // Long horizontal storage corridor below Human pill / above E row
  { id: 'es-corridor-1', x: 0.357, y: 0.554, w: 0.040, h: 0.060 },
  { id: 'es-corridor-2', x: 0.4, y: 0.587, w: 0.045, h: 0.030 },
  // Big lobby strip extending across centre (under Creative pill area)
  { id: 'es-lobby', x: 0.235, y: 0.605, w: 0.20, h: 0.034 },
  // Storage below Creative pill / right edge of G column
  { id: 'es-creative-stub', x: 0.157, y: 0.610, w: 0.058, h: 0.028 },
  // Long horizontal slot above Journey pill (mid-bottom)
  { id: 'es-journey-top', x: 0.348, y: 0.695, w: 0.060, h: 0.045 },
  // Vertical thin slot near the rotated "프로필 E" text (bottom-left)
  { id: 'es-profile-e', x: 0.298, y: 0.860, w: 0.026, h: 0.070 },
  // Long horizontal slot just below F-1..F-4 (bottom-right corner)
  { id: 'es-f-bottom', x: 0.755, y: 0.945, w: 0.10, h: 0.022 },
];
