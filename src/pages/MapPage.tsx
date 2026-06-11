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
import {
  BOOTHS,
  EXPERIENCE_CATEGORIES,
  FIGMA_MAP_SIZE,
} from '@/data';
import type {
  Booth,
  ExperienceCategory,
  ExperienceCategoryId,
} from '@/data';
import {
  CategoryPillButton,
  CategoryTileButton,
  LocationDebugOverlay,
  MapCanvas,
  MapTutorialOverlay,
} from '@/components';
import * as S from './MapPage.styled';

interface MapPageProps {
  onClickQr: () => void;
  onPickCategory: (categoryId: ExperienceCategoryId) => void;
  onPickBooth: (booth: Booth) => void;
  highlightedBoothId?: string | null;
  showLocationDebug?: boolean;
  showTutorial?: boolean;
  onTutorialDismiss?: () => void;
}

const MIN_SCALE = 0.25;
const MAX_SCALE = 2.6;
const DRAG_THRESHOLD_PX = 6;
const PINCH_THRESHOLD_PX = 4;
const NATURAL_MAP_W = FIGMA_MAP_SIZE.w;
const NATURAL_MAP_H = FIGMA_MAP_SIZE.h;
const MOBILE_INITIAL_TOP_OFFSET = 58;
const MAP_HEADER_SAFE_TOP = 58;

function getInitialScale(stageWidth: number, stageHeight: number): number {
  const widthScale = (stageWidth - 32) / NATURAL_MAP_W;
  const topOffset = getInitialTopOffset(stageWidth);
  const heightScale = (stageHeight + topOffset) / NATURAL_MAP_H;
  return Math.min(0.62, Math.max(0.36, widthScale, heightScale));
}

function getInitialTopOffset(stageWidth: number): number {
  return stageWidth <= 520 ? MOBILE_INITIAL_TOP_OFFSET : 0;
}

function getMapTopLimit(stageWidth: number): number {
  return stageWidth <= 520 ? MAP_HEADER_SAFE_TOP : 48;
}

function clampMapTranslate(
  s: number,
  rawTx: number,
  rawTy: number,
  stageW: number,
  stageH: number,
  baseW: number,
  baseH: number,
): { readonly tx: number; readonly ty: number } {
  const dispW = baseW * s;
  const dispH = baseH * s;
  const maxTop = getMapTopLimit(stageW);

  const minTx = Math.min(0, stageW - dispW);
  const maxTx = Math.max(0, stageW - dispW);
  const minTy = Math.min(0, stageH - dispH);
  const maxTy = Math.max(maxTop, stageH - dispH);

  return {
    tx: Math.min(Math.max(rawTx, minTx), maxTx),
    ty: Math.min(Math.max(rawTy, minTy), maxTy),
  };
}

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
  } as CSSProperties;
}

function shouldRenderBoothLabel(booth: Booth): boolean {
  return Boolean(booth.serviceName);
}

function isInteractiveBooth(booth: Booth): boolean {
  return Boolean(booth.serviceName) && !booth.aux;
}

function serviceLabelOrientation(booth: Booth): 'horizontal' | 'vertical' {
  return booth.h > booth.w ? 'vertical' : 'horizontal';
}

interface ActivePointer {
  x: number;
  y: number;
}

function MapPage({
  onClickQr,
  onPickCategory,
  onPickBooth,
  highlightedBoothId = null,
  showLocationDebug = false,
  showTutorial = false,
  onTutorialDismiss,
}: MapPageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const showQueryLocationDebug =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('debugLocation') === '1';
  const shouldShowLocationDebug = showLocationDebug || showQueryLocationDebug;
  const highlightedBooth =
    highlightedBoothId === null
      ? null
      : BOOTHS.find((booth) => booth.id === highlightedBoothId) ?? null;

  const [stageSize, setStageSize] = useState({ w: 0, h: 0 });
  const [baseSize, setBaseSize] = useState({ w: 0, h: 0 });
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);

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
      return clampMapTranslate(
        s,
        rawTx,
        rawTy,
        stageSize.w,
        stageSize.h,
        baseSize.w,
        baseSize.h,
      );
    },
    [baseSize, stageSize],
  );

  const recomputeBaseSize = useCallback(() => {
    const stageEl = stageRef.current;
    if (!stageEl) return;

    const rect = stageEl.getBoundingClientRect();

    const baseW = NATURAL_MAP_W;
    const baseH = NATURAL_MAP_H;

    setStageSize({ w: rect.width, h: rect.height });
    setBaseSize({ w: baseW, h: baseH });

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
    const zoomValue = params?.get('zoom');
    const zoomParam = zoomValue === null ? null : Number(zoomValue);

    const initialScale = typeof zoomParam === 'number' && Number.isFinite(zoomParam)
      ? Math.min(MAX_SCALE, Math.max(MIN_SCALE, zoomParam))
      : getInitialScale(rect.width, rect.height);
    setScale(initialScale);
    if (focal) {
      const positioned = clampMapTranslate(
        initialScale,
        rect.width / 2 - focal.x * baseW * initialScale,
        rect.height / 2 - focal.y * baseH * initialScale,
        rect.width,
        rect.height,
        baseW,
        baseH,
      );
      setTx(positioned.tx);
      setTy(positioned.ty);
    } else {
      const positioned = clampMapTranslate(
        initialScale,
        (rect.width - baseW * initialScale) / 2,
        getInitialTopOffset(rect.width),
        rect.width,
        rect.height,
        baseW,
        baseH,
      );
      setTx(positioned.tx);
      setTy(positioned.ty);
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

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const blockBrowserZoom = (event: WheelEvent) => {
      event.preventDefault();
    };
    stage.addEventListener('wheel', blockBrowserZoom, { passive: false });
    return () => stage.removeEventListener('wheel', blockBrowserZoom);
  }, []);

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
    e.preventDefault();
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
    onPickBooth(booth);
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
        <S.Logo
          src="/assets/brand/ieum-client-header-logo.svg"
          alt="I.EUM"
          draggable={false}
        />
        <S.StopBadge>관람중단</S.StopBadge>
      </S.Header>

      <S.Stage
        data-map-stage
        ref={stageRef}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
      >
        <S.ImageGroup
          data-map-image-group
          style={{
            transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
            width: baseSize.w || undefined,
            height: baseSize.h || undefined,
          }}
        >
          {baseSize.w > 0 ? (
            <MapCanvas width={baseSize.w} height={baseSize.h} />
          ) : null}

          {BOOTHS.map((booth) =>
            isInteractiveBooth(booth) ? (
              <CategoryTileButton
                key={booth.id}
                color={booth.color}
                label={booth.title}
                serviceName={booth.serviceName}
                showServiceName={shouldRenderBoothLabel(booth)}
                showLabel={false}
                serviceOrientation={serviceLabelOrientation(booth)}
                hitboxOnly={false}
                labelOffsetY={booth.labelOffsetY}
                style={tileStyle(booth)}
                onClick={(e) => handleBoothClick(booth, e)}
                aria-label={`${booth.title} ${booth.serviceName}`}
                title={`${booth.title} · ${booth.serviceName}`}
              />
            ) : (
              <S.EmptyBooth
                key={booth.id}
                $color={booth.color}
                data-booth-empty={booth.id}
                style={tileStyle(booth)}
                aria-hidden="true"
              />
            ),
          )}
          {highlightedBooth ? (
            <S.ProjectHighlight
              $color={highlightedBooth.color}
              style={tileStyle(highlightedBooth)}
              aria-hidden="true"
            />
          ) : null}

        </S.ImageGroup>

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

      {!showTutorial ? (
        <S.QrFab type="button" onClick={onClickQr} aria-label="QR 스캔 열기">
          <img
            src="/assets/icons/qr_button_icon.svg"
            alt=""
            aria-hidden="true"
            draggable={false}
          />
        </S.QrFab>
      ) : null}
      {showTutorial && onTutorialDismiss ? (
        <MapTutorialOverlay onDismiss={onTutorialDismiss} />
      ) : null}
      {shouldShowLocationDebug ? <LocationDebugOverlay /> : null}
    </S.Page>
  );
}

export default MapPage;
