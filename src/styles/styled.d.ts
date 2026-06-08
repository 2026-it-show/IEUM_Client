import 'styled-components';
import type { AppTheme } from './theme';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: AppTheme['colors'];
    fonts: AppTheme['fonts'];
    viewport: AppTheme['viewport'];
    layout: AppTheme['layout'];
    radius: AppTheme['radius'];
  }
}
