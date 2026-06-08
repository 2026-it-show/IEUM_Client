import * as S from './ServiceIntroSection.styled';

interface ServiceIntroSectionProps {
  onFeedback: () => void;
  onHire: () => void;
}

const TAGS: Array<{ label: string; bg: string; color: string }> = [
  { label: 'Language', bg: '#DCE9FB', color: '#3C6CB8' },
  { label: 'Framework', bg: '#FBDDE3', color: '#D4596A' },
  { label: 'Database', bg: '#D7F0DD', color: '#3FA45A' },
  { label: 'External API / AI', bg: '#FCF1CE', color: '#C9A33A' },
  { label: 'Tools & Container', bg: '#D6F0E5', color: '#3DA784' },
];

function ServiceIntroSection({
  onFeedback,
  onHire,
}: ServiceIntroSectionProps) {
  return (
    <S.Wrapper>
      <S.ScrollArea>
        <S.Banner>GLOBAL EXPERIENCE</S.Banner>

        <S.Card>
          <img src="/assets/image/growvy.png" alt="Growy 서비스 미리보기" />
        </S.Card>

        <S.TitleRow>
          <S.ServiceName>Growy</S.ServiceName>
          <S.LikeButton type="button" aria-label="좋아요">
            <img src="/assets/icons/like_icon.svg" alt="" aria-hidden="true" />
          </S.LikeButton>
        </S.TitleRow>

        <S.Description>
          {
            '호주 Gap Year 청년들이 다양한 경험을 통해\n자신의 적성을 발견하고 기록하는 구인구직 서비스'
          }
        </S.Description>

        <S.TagList>
          {TAGS.map((tag) => (
            <S.Tag key={tag.label} $bg={tag.bg} $color={tag.color}>
              {tag.label}
            </S.Tag>
          ))}
        </S.TagList>
      </S.ScrollArea>

      <S.BottomCTA>
        <S.FeedbackButton type="button" onClick={onFeedback}>
          피드백
        </S.FeedbackButton>
        <S.HireButton type="button" onClick={onHire}>
          채용
        </S.HireButton>
      </S.BottomCTA>
    </S.Wrapper>
  );
}

export default ServiceIntroSection;
