import styled from 'styled-components';

export const Overlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 8;
  background: rgba(0, 0, 0, 0.72);
  color: ${({ theme }) => theme.colors.white};
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
`;

export const PinchGuide = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
`;

export const PinchIcon = styled.img`
  position: absolute;
  top: 46.33%;
  left: 50%;
  width: 43px;
  height: 43px;
  transform: translateX(-50%);
`;

export const CenterCaption = styled.p`
  position: absolute;
  top: calc(46.33% + 62px);
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.5;
  text-align: center;
  word-break: keep-all;
  white-space: nowrap;
`;

export const QrCaption = styled.p`
  position: absolute;
  left: calc(215.5 / 390 * 100%);
  top: calc(687 / 844 * 100%);
  width: min(293px, calc(100% - 56px));
  margin: 0;
  transform: translateX(-50%);
  font-size: 12px;
  font-weight: 500;
  line-height: 1.5;
  text-align: center;
  word-break: keep-all;
`;

export const QrArrow = styled.img`
  position: absolute;
  left: calc(262 / 390 * 100%);
  top: calc(739 / 844 * 100%);
  width: 35px;
  height: 36px;
  transform: rotate(180deg);
  pointer-events: none;
`;

export const QrSpot = styled.div`
  position: absolute;
  left: calc(304 / 390 * 100%);
  top: calc(763 / 844 * 100%);
  width: 52px;
  height: 50px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #4e3e85;
  color: ${({ theme }) => theme.colors.white};
  font-size: 20px;
  font-weight: 500;
  line-height: 1.5;
  pointer-events: none;
  filter: drop-shadow(0 4px 14px rgba(78, 62, 133, 0.55));
`;
