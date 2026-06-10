import type { ButtonHTMLAttributes, CSSProperties } from 'react';
import * as S from './CategoryTileButton.styled';

interface CategoryTileButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  color: string;
  label: string;
  serviceName?: string;
  showServiceName?: boolean;
  showLabel?: boolean;
  hitboxOnly?: boolean;
  serviceOrientation?: 'horizontal' | 'vertical';
  labelOffsetY?: number;
}

function CategoryTileButton({
  color,
  label,
  serviceName,
  showServiceName = false,
  showLabel = true,
  hitboxOnly = false,
  serviceOrientation = 'horizontal',
  labelOffsetY,
  ...rest
}: CategoryTileButtonProps) {
  const displayServiceName = showServiceName && Boolean(serviceName);
  const labelStyle: CSSProperties | undefined =
    typeof labelOffsetY === 'number' && labelOffsetY !== 0
      ? ({ ['--lbl-offset-y' as string]: `${labelOffsetY}px` } as CSSProperties)
      : undefined;

  return (
    <S.TileButton
      type="button"
      $color={color}
      $hitboxOnly={hitboxOnly}
      $clipLabel={displayServiceName}
      {...rest}
    >
      {displayServiceName ? (
        <S.TileLabelService
          $orientation={serviceOrientation}
          style={labelStyle}
        >
          <S.TileLabelCode>{label}</S.TileLabelCode>
          <S.TileLabelName>{serviceName}</S.TileLabelName>
        </S.TileLabelService>
      ) : showLabel ? (
        <S.TileLabel style={labelStyle}>{label}</S.TileLabel>
      ) : null}
    </S.TileButton>
  );
}

export default CategoryTileButton;
