import styled, { css } from 'styled-components';

interface ColorProps {
  $color: string;
  $hitboxOnly: boolean;
  $clipLabel: boolean;
}

const baseTile = css`
  position: absolute;
  z-index: 2;
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
  overflow: visible;
`;

export const TileButton = styled.button<ColorProps>`
  ${baseTile};
  background: ${({ $color }) => $color};
  color: #ffffff;
  border-radius: 0;
  overflow: hidden;

  &:hover {
    filter: brightness(1.08);
  }

  &:focus-visible {
    filter: brightness(1.08);
    outline: none;
  }

  &:active {
    transform: translate(-50%, -50%) scale(0.94);
    filter: brightness(0.96);
  }

  &[aria-pressed='true'] {
    filter: brightness(1.18);
  }

  ${({ $hitboxOnly }) =>
    $hitboxOnly
      ? css`
          background: transparent;
          color: transparent;

          &:hover,
          &:active {
            filter: none;
          }

          &:focus-visible {
            outline: 2px solid rgba(78, 62, 133, 0.7);
            outline-offset: 2px;
          }
        `
      : null}
`;

export const TileLabel = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, calc(-50% + var(--lbl-offset-y, 0px)));
  width: max-content;
  max-width: none;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  pointer-events: none;
  -webkit-text-stroke: 2px rgba(60, 60, 67, 0.55);
  paint-order: stroke fill;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.25);
`;

export const TileLabelService = styled.span<{
  $orientation: 'horizontal' | 'vertical';
}>`
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(100% - 6px);
  height: calc(100% - 6px);
  max-width: calc(100% - 6px);
  max-height: calc(100% - 6px);
  transform: ${({ $orientation }) =>
    $orientation === 'vertical'
      ? 'translate(-50%, -50%) rotate(-90deg)'
      : 'translate(-50%, -50%)'};
  transform-origin: center;
  letter-spacing: 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  overflow: hidden;
  pointer-events: none;
  color: #ffffff;
  -webkit-text-stroke: 2px rgba(60, 60, 67, 0.58);
  paint-order: stroke fill;
  text-shadow: 0 0 1px rgba(0, 0, 0, 0.22);
`;

export const TileLabelCode = styled.span`
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: clip;
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
`;

export const TileLabelName = styled.span`
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: clip;
  font-size: 9px;
  font-weight: 800;
  line-height: 1;
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
