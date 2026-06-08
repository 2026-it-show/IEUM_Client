import { Fragment } from 'react';
import type { ButtonHTMLAttributes, CSSProperties } from 'react';
import * as S from './CategoryTileButton.styled';

interface CategoryTileButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Background fill of the tile (category color) */
  color: string;
  /** Booth code label, e.g. "A1", "B-2" */
  label: string;
  /** Service name to show when the map is zoomed in */
  serviceName?: string;
  /** Show service name instead of label */
  showServiceName?: boolean;
  /**
   * Optional vertical nudge of the LABEL only (the booth body stays in its
   * single row). Used by the E-row so adjacent service-name labels can
   * alternate above/below and never run into each other.
   */
  labelOffsetY?: number;
}

/** Split a service name into individual words rendered on their own line. */
function renderMultilineName(name: string) {
  const words = name.split(/\s+/).filter(Boolean);
  return words.map((word, i) => (
    <Fragment key={`${i}-${word}`}>
      {i > 0 && <br />}
      {word}
    </Fragment>
  ));
}

/**
 * Booth-shaped clickable tile that visually replaces the
 * coloured rectangles on the map.
 */
function CategoryTileButton({
  color,
  label,
  serviceName,
  showServiceName = false,
  labelOffsetY,
  ...rest
}: CategoryTileButtonProps) {
  const displayServiceName = showServiceName && Boolean(serviceName);
  const labelStyle: CSSProperties | undefined =
    typeof labelOffsetY === 'number' && labelOffsetY !== 0
      ? ({ ['--lbl-offset-y' as string]: `${labelOffsetY}px` } as CSSProperties)
      : undefined;

  return (
    <S.TileButton type="button" $color={color} {...rest}>
      {displayServiceName ? (
        <S.TileLabelService style={labelStyle}>
          {renderMultilineName(serviceName!)}
        </S.TileLabelService>
      ) : (
        <S.TileLabel style={labelStyle}>{label}</S.TileLabel>
      )}
    </S.TileButton>
  );
}

export default CategoryTileButton;
