import styled from 'styled-components';

export const Page = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.white};
  overflow: hidden;
`;

export const StatusText = styled.p`
  padding: 32px ${({ theme }) => theme.layout.pagePadding};
  font-size: 15px;
  line-height: 1.5;
  color: #777777;
`;
