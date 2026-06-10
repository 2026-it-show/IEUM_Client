import styled from 'styled-components';

interface ColorProps {
  $color: string;
  $hitboxOnly: boolean;
}

/**
 * Fixed-size category pill. Stays compact regardless of the
 * surrounding map's zoom level (rendered outside the transformed group).
 * Stroke and text both use the section's category colour.
 */
export const PillButton = styled.button<ColorProps>`
  position: absolute;
  z-index: 5;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 84px;
  height: 40px;
  padding: 0;
  margin: 0;
  /* 2px stroke in the section colour */
  border: 1px solid ${({ $color }) => $color};
  background: #ffffff;
  color: ${({ $color }) => $color};
  border-radius: 999px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transform: translate(-50%, -50%);
  transform-origin: center;
  transition: transform 160ms ease, box-shadow 160ms ease;
  white-space: nowrap;
  line-height: 1;

  &:hover,
  &:focus-visible {
    transform: translate(-50%, calc(-50% - 1px));
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
    outline: none;
  }

  &:active {
    transform: translate(-50%, -50%) scale(0.96);
  }

  ${({ $hitboxOnly }) =>
    $hitboxOnly
      ? `
        opacity: 0;
        box-shadow: none;
      `
      : ''}
`;

export const PillTitle = styled.span`
  display: block;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0;
  color: inherit;
  line-height: 1.1;
`;

export const PillSubtitle = styled.span`
  display: block;
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 0;
  /* Subtitle (“Experience”) shares the section colour, per spec */
  color: inherit;
  margin-top: 1px;
  line-height: 1;
`;
