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

export const MemberItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const MemberCard = styled.button<{ $selected: boolean; $hired: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 20px 28px;
  border-radius: 12px;
  border: ${({ $selected, theme }) =>
    $selected
      ? `2px solid ${theme.colors.primary}`
      : '1px solid #D9D9D9'};
  background-color: ${({ $selected }) =>
    $selected ? 'rgba(236, 86, 101, 0.2)' : '#FFFFFF'};
  opacity: ${({ $hired }) => ($hired ? 0.55 : 1)};
  text-align: left;
  cursor: ${({ $hired }) => ($hired ? 'default' : 'pointer')};
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;
`;

export const MemberName = styled.span<{ $selected?: boolean }>`
  font-size: 20px;
  line-height: 30px;
  color: ${({ $selected }) => ($selected ? '#555555' : '#222222')};
`;

export const MemberRole = styled.span`
  font-size: 14px;
  line-height: 21px;
  color: #555555;
`;

export const HiredBadge = styled.span`
  position: absolute;
  top: 20px;
  right: 28px;
  font-size: 12px;
  line-height: 21px;
  color: ${({ theme }) => theme.colors.primary};
`;

export const OtherProjectsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
`;

export const OtherProjectsText = styled.p`
  font-size: 11px;
  line-height: 1;
  color: #555555;
`;

export const OtherProjectsLink = styled.button`
  flex: 0 0 auto;
  font-size: 12px;
  line-height: 1;
  color: #555555;
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
`;

export const EmptyText = styled.p`
  padding: 12px 4px;
  font-size: 15px;
  line-height: 1.5;
  color: #777777;
`;

export const BottomCTA = styled.div`
  position: absolute;
  left: ${({ theme }) => theme.layout.pagePadding};
  right: ${({ theme }) => theme.layout.pagePadding};
  bottom: ${({ theme }) => theme.layout.bottomCTAOffset};
`;
