import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  WheelEvent as ReactWheelEvent,
} from 'react';
import { EXPERIENCE_CATEGORIES, BOOTHS } from '@/data';
import type {
  Booth,
  ExperienceCategory,
  ExperienceCategoryId,
} from '@/data';
import {
  CategoryPillButton,
  CategoryTileButton,
  MapCanvas,
} from '@/components';
import * as S from './MapPage.styled';

interface MapPageProps {
  onClickQr: () => void;
  onPickCategory: (categoryId: ExperienceCategoryId) => void;
}

const MIN_SCALE = 0.5;
const MAX_SCALE = 3.6;
const DRAG_THRESHOLD_PX = 6;
/** Scale at which booth tiles switch from booth code → service name. */
const SERVICE_NAME_SCALE = 1.5;
const PINCH_THRESHOLD_PX = 4;
/** Initial zoom – the user explicitly asked for "기본값을 더 확대해". */
const INITIAL_SCALE = 1.5;

/**
 * The map is rendered at its NATURAL pixel size (no fit-to-stage scaling) so
 * that the booth sizes resolve exactly to the values requested by the spec
 * (23×28, 11×36, 36×11 px). The stage just clips, and the user pans /
 * pinch-zooms in both directions to see the whole floor.
 */
// Match the natural size declared in src/data/booths.ts (MAP_W × MAP_H).
// Tightening MAP_W brings columns horizontally closer together so the map
// has less white space, while individual booth dimensions stay unchanged.
const NATURAL_MAP_W = 590;
const NATURAL_MAP_H = 1024;

function tileStyle(item: {
  x: number;
  y: number;
  w: number;
  h: number;
}): CSSProperties {
  return {
    left: `${item.x * 100}%`,
    top: `${item.y * 100}%`,
    width: `${item.w * 100}%`,
    height: `${item.h * 100}%`,
  };
}

interface ActivePointer {
  x: number;
  y: number;
}

function MapPage({ onClickQr, onPickCategory }: MapPageProps) {
  const stageRef = useRef<HTMLDivElement>(null);

  const [stageSize, setStageSize] = useState({ w: 0, h: 0 });
  const [baseSize, setBaseSize] = useState({ w: 0, h: 0 });
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);

  const showServiceName = scale >= SERVICE_NAME_SCALE;

  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    baseTx: number;
    baseTy: number;
    moved: boolean;
    captured: boolean;
  } | null>(null);

  const pointersRef = useRef<Map<number, ActivePointer>>(new Map());
  const pinchRef = useRef<{
    startDist: number;
    startScale: number;
    centreStageX: number;
    centreStageY: number;
    centreImgX: number;
    centreImgY: number;
  } | null>(null);

  const clampTranslate = useCallback(
    (s: number, rawTx: number, rawTy: number) => {
      const dispW = baseSize.w * s;
      const dispH = baseSize.h * s;
      const stageW = stageSize.w;
      const stageH = stageSize.h;

      const minTx = Math.min(0, stageW - dispW);
      const maxTx = Math.max(0, stageW - dispW);
      const minTy = Math.min(0, stageH - dispH);
      const maxTy = Math.max(0, stageH - dispH);

      return {
        tx: Math.min(Math.max(rawTx, minTx), maxTx),
        ty: Math.min(Math.max(rawTy, minTy), maxTy),
      };
    },
    [baseSize, stageSize],
  );

  const recomputeBaseSize = useCallback(() => {
    const stageEl = stageRef.current;
    if (!stageEl) return;

    const rect = stageEl.getBoundingClientRect();

    // Fixed natural map size – the map is *not* fit to the stage. Booths get
    // their exact spec-pixel sizes (23×28 etc.) and the user pans both axes.
    const baseW = NATURAL_MAP_W;
    const baseH = NATURAL_MAP_H;

    setStageSize({ w: rect.width, h: rect.height });
    setBaseSize({ w: baseW, h: baseH });

    // Optional ?focus=<id> query lets us deep-link the initial map view to a
    // specific point on the floor – handy for sharing & QA screenshots.
    const params =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search)
        : null;
    const focus = params?.get('focus');
    const FOCAL_POINTS: Record<string, { x: number; y: number }> = {
      'top-left': { x: 0.0, y: 0.0 },
      a: { x: 0.137, y: 0.32 },
      b: { x: 0.386, y: 0.32 },
      c: { x: 0.566, y: 0.27 },
      d: { x: 0.723, y: 0.27 },
      e: { x: 0.74, y: 0.61 },
      f: { x: 0.708, y: 0.78 },
      g: { x: 0.102, y: 0.62 },
    };
    const focal = (focus && FOCAL_POINTS[focus]) || null;

    setScale(INITIAL_SCALE);
    if (focal) {
      // Centre the focal point in the stage.
      setTx(rect.width / 2 - focal.x * baseW * INITIAL_SCALE);
      setTy(rect.height / 2 - focal.y * baseH * INITIAL_SCALE);
    } else {
      // Top-left aligned by default so column A + top-row horizontals are
      // visible right away.
      setTx(0);
      setTy(0);
    }
  }, []);

  useLayoutEffect(() => {
    recomputeBaseSize();
  }, [recomputeBaseSize]);

  useEffect(() => {
    const onResize = () => recomputeBaseSize();
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, [recomputeBaseSize]);

  const applyZoomAt = useCallback(
    (nextScale: number, anchorStageX: number, anchorStageY: number) => {
      const clampedScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, nextScale));
      const imgX = (anchorStageX - tx) / scale;
      const imgY = (anchorStageY - ty) / scale;
      const newTx = anchorStageX - imgX * clampedScale;
      const newTy = anchorStageY - imgY * clampedScale;
      const clamped = clampTranslate(clampedScale, newTx, newTy);
      setScale(clampedScale);
      setTx(clamped.tx);
      setTy(clamped.ty);
    },
    [clampTranslate, scale, tx, ty],
  );

  const handleWheel = (e: ReactWheelEvent<HTMLDivElement>) => {
    if (!stageRef.current || baseSize.w === 0) return;
    const stageRect = stageRef.current.getBoundingClientRect();
    const px = e.clientX - stageRect.left;
    const py = e.clientY - stageRect.top;
    const factor = Math.pow(1.0015, -e.deltaY);
    applyZoomAt(scale * factor, px, py);
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    const stageRect = stageRef.current.getBoundingClientRect();
    const localX = e.clientX - stageRect.left;
    const localY = e.clientY - stageRect.top;
    pointersRef.current.set(e.pointerId, { x: localX, y: localY });

    if (pointersRef.current.size === 1) {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      dragRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        baseTx: tx,
        baseTy: ty,
        moved: false,
        captured: false,
      };
    } else if (pointersRef.current.size === 2) {
      // Begin pinch
      const pts = Array.from(pointersRef.current.values());
      const dx = pts[0].x - pts[1].x;
      const dy = pts[0].y - pts[1].y;
      const startDist = Math.hypot(dx, dy) || 1;
      const centreStageX = (pts[0].x + pts[1].x) / 2;
      const centreStageY = (pts[0].y + pts[1].y) / 2;
      pinchRef.current = {
        startDist,
        startScale: scale,
        centreStageX,
        centreStageY,
        centreImgX: (centreStageX - tx) / scale,
        centreImgY: (centreStageY - ty) / scale,
      };
      dragRef.current = null;
    }
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    const stageRect = stageRef.current.getBoundingClientRect();
    const localX = e.clientX - stageRect.left;
    const localY = e.clientY - stageRect.top;

    if (pointersRef.current.has(e.pointerId)) {
      pointersRef.current.set(e.pointerId, { x: localX, y: localY });
    }

    // Pinch zoom (two pointers)
    if (pointersRef.current.size === 2 && pinchRef.current) {
      const pts = Array.from(pointersRef.current.values());
      const dx = pts[0].x - pts[1].x;
      const dy = pts[0].y - pts[1].y;
      const dist = Math.hypot(dx, dy) || 1;
      if (Math.abs(dist - pinchRef.current.startDist) > PINCH_THRESHOLD_PX) {
        const pinch = pinchRef.current;
        const nextScale = Math.min(
          MAX_SCALE,
          Math.max(MIN_SCALE, (pinch.startScale * dist) / pinch.startDist),
        );
        const newTx = pinch.centreStageX - pinch.centreImgX * nextScale;
        const newTy = pinch.centreStageY - pinch.centreImgY * nextScale;
        const clamped = clampTranslate(nextScale, newTx, newTy);
        setScale(nextScale);
        setTx(clamped.tx);
        setTy(clamped.ty);
      }
      return;
    }

    // Drag-pan (one pointer)
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) {
      drag.moved = true;
      if (!drag.captured) {
        try {
          (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
          drag.captured = true;
        } catch {
          /* ignore capture failure */
        }
      }
    }
    if (drag.moved) {
      const next = clampTranslate(scale, drag.baseTx + dx, drag.baseTy + dy);
      setTx(next.tx);
      setTy(next.ty);
    }
  };

  const endPointer = (e: ReactPointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) {
      pinchRef.current = null;
    }
    const drag = dragRef.current;
    if (drag && drag.pointerId === e.pointerId) {
      if (
        drag.captured &&
        (e.currentTarget as HTMLDivElement).hasPointerCapture(e.pointerId)
      ) {
        (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
      }
      dragRef.current = null;
    }
  };

  const handleBoothClick = (
    booth: Booth,
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.stopPropagation();
    onPickCategory(booth.categoryId);
  };

  const handlePillClick = (
    category: ExperienceCategory,
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.stopPropagation();
    onPickCategory(category.id);
  };

  return (
    <S.Page>
      <S.Header>
        <S.Logo src="/assets/icons/logo1.svg" alt="I.EUM" />
        <S.StopBadge>관람중단</S.StopBadge>
      </S.Header>

      <S.Stage
        ref={stageRef}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
      >
        <S.ImageGroup
          style={{
            transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
            width: baseSize.w || undefined,
            height: baseSize.h || undefined,
          }}
        >
          {baseSize.w > 0 ? (
            <MapCanvas width={baseSize.w} height={baseSize.h} />
          ) : null}

          {/* 부스 버튼: map 위 모든 colored 네모를 동일한 위치/크기로 덮음 */}
          {BOOTHS.map((booth) => (
            <CategoryTileButton
              key={booth.id}
              color={booth.color}
              label={booth.title}
              serviceName={booth.serviceName}
              showServiceName={showServiceName}
              labelOffsetY={booth.labelOffsetY}
              style={tileStyle(booth)}
              onClick={(e) => handleBoothClick(booth, e)}
              aria-label={
                booth.serviceName
                  ? `${booth.title} ${booth.serviceName}`
                  : booth.title
              }
              title={
                booth.serviceName
                  ? `${booth.title} · ${booth.serviceName}`
                  : booth.title
              }
            />
          ))}

        </S.ImageGroup>

        {/* 카테고리 라벨(흰 알약)은 줌과 독립적으로 고정 크기(119.21×55.95)를
            유지해야 하므로 변환 그룹 밖에서 화면 좌표로 직접 배치합니다. */}
        <S.PillLayer aria-hidden={baseSize.w === 0 ? true : undefined}>
          {baseSize.w > 0 &&
            EXPERIENCE_CATEGORIES.map((category) => {
              const [titleWord] = category.title.split(' ');
              const screenX = tx + category.x * baseSize.w * scale;
              const screenY = ty + category.y * baseSize.h * scale;
              return (
                <CategoryPillButton
                  key={category.id}
                  color={category.color}
                  title={titleWord}
                  subtitle="Experience"
                  style={{ left: `${screenX}px`, top: `${screenY}px` }}
                  onClick={(e) => handlePillClick(category, e)}
                  aria-label={category.title}
                />
              );
            })}
        </S.PillLayer>
      </S.Stage>

      <S.QrFab type="button" onClick={onClickQr} aria-label="QR 스캔 열기">
        <img src="/assets/icons/qr_button_icon.svg" alt="" aria-hidden="true" />
      </S.QrFab>
    </S.Page>
  );
}

export default MapPage;
