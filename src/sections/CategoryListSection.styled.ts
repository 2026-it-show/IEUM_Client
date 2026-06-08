import styled from 'styled-components';

export const Wrapper = styled.section`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
  padding: 18px ${({ theme }) => theme.layout.pagePadding} 40px;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const GroupLabel = styled.div`
  display: inline-flex;
  align-self: flex-start;
  align-items: center;
  justify-content: center;
  padding: 6px 14px;
  border-radius: 999px;
  background-color: #fbdde3;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 13px;
  letter-spacing: 0.5px;
  margin-top: 14px;
  margin-bottom: 14px;
`;

export const Message = styled.p`
  padding: 30px 4px;
  font-size: 15px;
  line-height: 1.5;
  color: #777777;
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px 16px;
`;

export const Card = styled.button`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
`;

export const Thumbnail = styled.div`
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 12px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.gray100};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

export const CardName = styled.span`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.black};
  padding-left: 4px;
`;
