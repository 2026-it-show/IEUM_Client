import styled from 'styled-components';

export const Page = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  padding: 72px 24px calc(${({ theme }) => theme.layout.bottomCTAOffset} + 79px);
  background-color: ${({ theme }) => theme.colors.white};
`;

export const Title = styled.h1`
  margin: 0 0 22px;
  color: #222222;
  font-size: 20px;
  font-weight: 500;
  line-height: 1.5;
  text-align: center;
  letter-spacing: 0;
`;

export const FormBox = styled.div`
  flex: 1;
  min-height: 0;
  border: 1px solid #d9d9d9;
  border-radius: 24px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.white};
`;

export const Textarea = styled.textarea`
  width: 100%;
  height: 100%;
  padding: 29px;
  resize: none;
  border: 0;
  outline: none;
  color: #222222;
  background: transparent;
  font-size: 15px;
  line-height: 1.6;

  &::placeholder {
    color: #d9d9d9;
  }
`;

export const StatusMessage = styled.p`
  margin-top: 12px;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 13px;
  line-height: 1.5;
  text-align: center;
`;

export const BottomButton = styled.button`
  position: absolute;
  left: 24px;
  right: 24px;
  bottom: ${({ theme }) => theme.layout.bottomCTAOffset};
  height: 55px;
  border-radius: 12px;
  background-color: ${({ theme, disabled }) =>
    disabled ? '#b9b9b9' : theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  font-size: 20px;
  line-height: 1.5;
  text-align: center;
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
`;
