import styled from 'styled-components';

export const Wrapper = styled.section`
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

export const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px ${({ theme }) => theme.layout.pagePadding}
    calc(${({ theme }) => theme.layout.bottomCTAOffset} + 56px + 32px);
  display: flex;
  flex-direction: column;
  gap: 16px;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const MemberCard = styled.button<{ $selected: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 18px 22px;
  border-radius: 14px;
  border: 1.5px solid
    ${({ $selected, theme }) =>
      $selected ? theme.colors.primary : 'transparent'};
  background-color: ${({ $selected }) =>
    $selected ? '#FDECEF' : '#FFFFFF'};
  box-shadow: ${({ $selected }) =>
    $selected
      ? 'none'
      : '0 1px 3px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.04)'};
  text-align: left;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;
`;

export const MemberName = styled.span`
  font-size: 18px;
  line-height: 1.2;
  color: ${({ theme }) => theme.colors.black};
`;

export const MemberRole = styled.span`
  font-size: 13px;
  line-height: 1;
  color: #7a7a7a;
`;

export const BottomCTA = styled.div`
  position: absolute;
  left: ${({ theme }) => theme.layout.pagePadding};
  right: ${({ theme }) => theme.layout.pagePadding};
  bottom: ${({ theme }) => theme.layout.bottomCTAOffset};
`;
