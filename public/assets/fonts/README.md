# fonts

웹 폰트 파일(`.woff2`, `.woff`, `.ttf`)을 보관합니다.

## 사용 예시

`src/styles/fonts.css` 에서 `@font-face` 로 등록하고,
`src/styles/global.css` 의 `body { font-family: ... }` 에서 사용합니다.

```css
@font-face {
  font-family: 'Pretendard';
  src: url('@/assets/fonts/Pretendard-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```
