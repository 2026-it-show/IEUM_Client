import styled from 'styled-components';

export const Panel = styled.aside`
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: 92px;
  z-index: 8;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  border: 1px solid rgba(17, 24, 39, 0.12);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.94);
  color: ${({ theme }) => theme.colors.black};
  box-shadow: 0 10px 28px rgba(17, 24, 39, 0.16);
  user-select: text;
  -webkit-user-select: text;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

export const Title = styled.strong`
  font-size: 13px;
  line-height: 1.3;
`;

export const Button = styled.button`
  min-height: 32px;
  padding: 7px 10px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  font-size: 12px;
  line-height: 1;
`;

export const Grid = styled.dl`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 5px 10px;
  font-size: 12px;
  line-height: 1.35;
`;

export const Term = styled.dt`
  color: ${({ theme }) => theme.colors.gray500};
`;

export const Value = styled.dd`
  min-width: 0;
  word-break: break-all;
`;

export const Message = styled.p`
  color: ${({ theme }) => theme.colors.gray500};
  font-size: 12px;
  line-height: 1.45;
`;
