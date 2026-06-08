import { useMemo } from 'react';
import { BOOTHS, EMPTY_SLOTS } from '@/data';
import type { Booth } from '@/data';
import * as S from './MapCanvas.styled';

// Match src/data/booths.ts MAP_W / MAP_H so wiring + empty slot positions
// align pixel-perfectly with the booth tiles rendered on top.
const VB_W = 590;
const VB_H = 1024;

interface MapCanvasProps {
  /** Pixel width of the canvas (matches base map size). */
  width: number;
  /** Pixel height of the canvas (matches base map size). */
  height: number;
}

interface Pt {
  x: number;
  y: number;
}
interface Ln {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/** A linear cluster of booths that share an axis (vertical or horizontal). */
interface Cluster {
  axis: 'v' | 'h';
  booths: Booth[];
}

const PAD = 0.008; // distance between booth edge and the wire outline

/** Build clusters: group booths that share an x (vertical) or y (horizontal). */
function buildClusters(): Cluster[] {
  const visited = new Set<string>();
  const clusters: Cluster[] = [];
  const key = (n: number) => Math.round(n * 1000).toString();

  // Step 1: group by exact-ish X (vertical clusters)
  const byX = new Map<string, Booth[]>();
  for (const b of BOOTHS) {
    const k = `${b.categoryId}|${key(b.x)}`;
    if (!byX.has(k)) byX.set(k, []);
    byX.get(k)!.push(b);
  }
  for (const list of byX.values()) {
    if (list.length < 2) continue;
    // Two booths must also be vertically-stacked (different y values close enough)
    const sorted = [...list].sort((a, b) => a.y - b.y);
    clusters.push({ axis: 'v', booths: sorted });
    sorted.forEach((b) => visited.add(b.id));
  }

  // Step 2: remaining booths grouped by Y (horizontal clusters)
  const byY = new Map<string, Booth[]>();
  for (const b of BOOTHS) {
    if (visited.has(b.id)) continue;
    const k = `${b.categoryId}|${key(b.y)}`;
    if (!byY.has(k)) byY.set(k, []);
    byY.get(k)!.push(b);
  }
  for (const list of byY.values()) {
    if (list.length < 2) continue;
    const sorted = [...list].sort((a, b) => a.x - b.x);
    clusters.push({ axis: 'h', booths: sorted });
    sorted.forEach((b) => visited.add(b.id));
  }

  // Step 3: remaining standalone booths (B-5, C-5, E-6, A-5, …) – each is
  // surrounded by its own 1-rect outline.
  for (const b of BOOTHS) {
    if (visited.has(b.id)) continue;
    clusters.push({ axis: 'v', booths: [b] });
    visited.add(b.id);
  }

  return clusters;
}

/** Generate dots + lines tracing the perimeter of every cluster. */
function generateWiring(): { dots: Pt[]; lines: Ln[] } {
  const dots: Pt[] = [];
  const lines: Ln[] = [];

  for (const c of buildClusters()) {
    if (c.axis === 'v') {
      // All booths share x. Use first booth's width/x.
      const cx = c.booths[0].x;
      const halfW = c.booths[0].w / 2;
      const leftX = cx - halfW - PAD;
      const rightX = cx + halfW + PAD;

      const first = c.booths[0];
      const last = c.booths[c.booths.length - 1];
      const topY = first.y - first.h / 2 - PAD;
      const bottomY = last.y + last.h / 2 + PAD;

      // 4 perimeter sides
      lines.push({ x1: leftX, y1: topY, x2: rightX, y2: topY });
      lines.push({ x1: leftX, y1: bottomY, x2: rightX, y2: bottomY });
      lines.push({ x1: leftX, y1: topY, x2: leftX, y2: bottomY });
      lines.push({ x1: rightX, y1: topY, x2: rightX, y2: bottomY });

      // Corner dots
      dots.push({ x: leftX, y: topY });
      dots.push({ x: rightX, y: topY });
      dots.push({ x: leftX, y: bottomY });
      dots.push({ x: rightX, y: bottomY });

      // Side dots between every adjacent booth
      for (let i = 0; i < c.booths.length - 1; i += 1) {
        const midY = (c.booths[i].y + c.booths[i + 1].y) / 2;
        dots.push({ x: leftX, y: midY });
        dots.push({ x: rightX, y: midY });
      }
    } else {
      // horizontal cluster: all booths share y
      const cy = c.booths[0].y;
      const halfH = c.booths[0].h / 2;
      const topY = cy - halfH - PAD;
      const bottomY = cy + halfH + PAD;

      const first = c.booths[0];
      const last = c.booths[c.booths.length - 1];
      const leftX = first.x - first.w / 2 - PAD;
      const rightX = last.x + last.w / 2 + PAD;

      lines.push({ x1: leftX, y1: topY, x2: rightX, y2: topY });
      lines.push({ x1: leftX, y1: bottomY, x2: rightX, y2: bottomY });
      lines.push({ x1: leftX, y1: topY, x2: leftX, y2: bottomY });
      lines.push({ x1: rightX, y1: topY, x2: rightX, y2: bottomY });

      dots.push({ x: leftX, y: topY });
      dots.push({ x: rightX, y: topY });
      dots.push({ x: leftX, y: bottomY });
      dots.push({ x: rightX, y: bottomY });

      for (let i = 0; i < c.booths.length - 1; i += 1) {
        const midX = (c.booths[i].x + c.booths[i + 1].x) / 2;
        dots.push({ x: midX, y: topY });
        dots.push({ x: midX, y: bottomY });
      }
    }
  }

  return { dots, lines };
}

/**
 * Renders the static structure of the exhibition floor map purely with SVG:
 * - White background
 * - Mid-gray connector dots and outline lines around every booth/cluster
 * - Dashed empty rectangles for the storage / lobby boxes seen in the image
 *
 * Booth buttons and category pills are layered on top by MapPage.
 */
function MapCanvas({ width, height }: MapCanvasProps) {
  const wiring = useMemo(generateWiring, []);

  return (
    <S.Canvas style={{ width, height }}>
      <S.Svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* Connector lines */}
        {wiring.lines.map((ln, idx) => (
          <line
            key={`l-${idx}`}
            x1={ln.x1 * VB_W}
            y1={ln.y1 * VB_H}
            x2={ln.x2 * VB_W}
            y2={ln.y2 * VB_H}
            stroke="#C2C2C7"
            strokeWidth={1}
            strokeLinecap="round"
          />
        ))}

        {/* Dashed empty slots */}
        {EMPTY_SLOTS.map((slot) => (
          <rect
            key={slot.id}
            x={(slot.x - slot.w / 2) * VB_W}
            y={(slot.y - slot.h / 2) * VB_H}
            width={slot.w * VB_W}
            height={slot.h * VB_H}
            fill="none"
            stroke="#BFBFC4"
            strokeWidth={1.2}
            strokeDasharray="3.5 3"
          />
        ))}

        {/* Connector dots */}
        {wiring.dots.map((dt, idx) => (
          <circle
            key={`d-${idx}`}
            cx={dt.x * VB_W}
            cy={dt.y * VB_H}
            r={2.2}
            fill="#B5B5BA"
          />
        ))}
      </S.Svg>
    </S.Canvas>
  );
}

export default MapCanvas;
