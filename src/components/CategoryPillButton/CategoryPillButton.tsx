import type { ButtonHTMLAttributes } from 'react';
import * as S from './CategoryPillButton.styled';

interface CategoryPillButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Brand color (used for the title text) */
  color: string;
  /** Title text e.g. "AI" */
  title: string;
  /** Subtitle text e.g. "Experience" */
  subtitle?: string;
}

/**
 * White pill button representing a category label on the map.
 * Sits on top of the map image group via `style` (left/top in %).
 */
function CategoryPillButton({
  color,
  title,
  subtitle = 'Experience',
  ...rest
}: CategoryPillButtonProps) {
  return (
    <S.PillButton type="button" $color={color} {...rest}>
      <S.PillTitle>{title}</S.PillTitle>
      {subtitle ? <S.PillSubtitle>{subtitle}</S.PillSubtitle> : null}
    </S.PillButton>
  );
}

export default CategoryPillButton;
