import { MAP_LINE_LAYERS } from '@/data';
import * as S from './MapCanvas.styled';

interface MapCanvasProps {
  width: number;
  height: number;
}

function strokeWidthOf(item: object): number {
  if ('strokeWidth' in item && typeof item.strokeWidth === 'number') {
    return item.strokeWidth;
  }
  return 1;
}

function strokeDasharrayOf(item: object): string | undefined {
  if ('strokeDasharray' in item && typeof item.strokeDasharray === 'string') {
    return item.strokeDasharray;
  }
  return undefined;
}

function MapCanvas({ width, height }: MapCanvasProps) {
  return (
    <S.Canvas style={{ width, height }}>
      <S.Svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {MAP_LINE_LAYERS.map((layer) => {
          const [, , viewWidth, viewHeight] = layer.viewBox;
          const scaleX = layer.w / viewWidth;
          const scaleY = layer.h / viewHeight;

          return (
            <g
              key={layer.id}
              transform={`translate(${layer.x} ${layer.y}) scale(${scaleX} ${scaleY})`}
            >
              {layer.paths.map((path, index) => (
                <path
                  key={`${layer.id}-path-${index}`}
                  d={path.d}
                  fill="none"
                  stroke="#999999"
                  strokeWidth={strokeWidthOf(path)}
                  strokeDasharray={strokeDasharrayOf(path)}
                />
              ))}

              {layer.rects.map((rect, index) => (
                <rect
                  key={`${layer.id}-rect-${index}`}
                  x={rect.x}
                  y={rect.y}
                  width={rect.w}
                  height={rect.h}
                  fill="none"
                  stroke="#999999"
                  strokeWidth={strokeWidthOf(rect)}
                  strokeDasharray={strokeDasharrayOf(rect)}
                />
              ))}

              {layer.circles.map(([cx, cy, r], index) => (
                <circle
                  key={`${layer.id}-circle-${index}`}
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="#999999"
                  stroke="#999999"
                />
              ))}
            </g>
          );
        })}
      </S.Svg>
    </S.Canvas>
  );
}

export default MapCanvas;
