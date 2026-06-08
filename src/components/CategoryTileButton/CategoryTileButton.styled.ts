import styled, { css } from 'styled-components';

interface ColorProps {
  $color: string;
}

const baseTile = css`
  position: absolute;
  padding: 0;
  margin: 0;
  border: 0;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transform: translate(-50%, -50%);
  transform-origin: center;
  transition: filter 140ms ease;
  appearance: none;
  background: transparent;
  /**
   * Booth bodies are very small (down to 11px wide for "long" verticals)
   * so labels would otherwise be clipped.  We let them flow OUTSIDE the
   * coloured rectangle and rely on the text-stroke below for legibility
   * on the white background.
   */
  overflow: visible;
`;

export const TileButton = styled.button<ColorProps>`
  ${baseTile};
  background: ${({ $color }) => $color};
  color: #ffffff;
  /* User requirement: no rounded corners on booth rectangles */
  border-radius: 0;

  &:hover,
  &:focus-visible {
    filter: brightness(1.12);
    outline: none;
  }

  &:active {
    transform: translate(-50%, -50%) scale(0.94);
    filter: brightness(0.96);
  }

  &[aria-pressed='true'] {
    filter: brightness(1.18);
  }
`;

/**
 * Centred floating label.  Uses `position: absolute` so it can grow past
 * the booth's coloured body without breaking layout, and a contrast stroke
 * (`paint-order: stroke fill`) so the white glyphs stay legible whether they
 * land on the coloured tile or on the white background outside.
 */
export const TileLabel = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  /* --lbl-offset-y lets specific booths nudge their label above or below
     the booth's geometric centre (used by the E-row in a zig-zag so the
     long service-names never collide horizontally). */
  transform: translate(-50%, calc(-50% + var(--lbl-offset-y, 0px)));
  width: max-content;
  max-width: none;
  color: #ffffff;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  pointer-events: none;
  /* dual-readability halo */
  -webkit-text-stroke: 2px rgba(60, 60, 67, 0.55);
  paint-order: stroke fill;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.25);
`;

/**
 * Service-name label shown when the user zooms in.
 *
 * Words are rendered on their own lines (CategoryTileButton inserts a <br>
 * at every space) so a long name like "Feed or Protect" stacks vertically
 * instead of running into adjacent booth labels.
 */
export const TileLabelService = styled(TileLabel)`
  font-size: 8px;
  line-height: 1.05;
  white-space: normal;
  -webkit-text-stroke: 1.6px rgba(40, 40, 48, 0.6);
`;

export const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;
