import styled from 'styled-components';

export const Canvas = styled.div`
  position: absolute;
  inset: 0;
  background: #ffffff;
  display: block;
  pointer-events: none;
  z-index: 0;
`;

export const Svg = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  display: block;
`;
