import styled from 'styled-components';

export const Wrapper = styled.section`
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 24px ${({ theme }) => theme.layout.pagePadding}
    calc(${({ theme }) => theme.layout.bottomCTAOffset} + 56px + 24px);
`;

export const Textarea = styled.textarea`
  flex: 1;
  width: 100%;
  resize: none;
  border: 1.5px solid #e6e6e6;
  border-radius: 14px;
  padding: 20px 22px;
  font-family: inherit;
  font-size: 15px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.black};
  background-color: ${({ theme }) => theme.colors.white};
  outline: none;

  &::placeholder {
    color: #b9b9b9;
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const BottomCTA = styled.div`
  position: absolute;
  left: ${({ theme }) => theme.layout.pagePadding};
  right: ${({ theme }) => theme.layout.pagePadding};
  bottom: ${({ theme }) => theme.layout.bottomCTAOffset};
`;
