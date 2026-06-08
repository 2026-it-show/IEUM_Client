import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'GmarketSansMedium';
    src: url('/assets/fonts/GmarketSansMedium.otf') format('opentype');
    font-weight: 100 900;
    font-style: normal;
    font-display: swap;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  * {
    margin: 0;
    padding: 0;
  }

  html, body {
    width: 100%;
    height: 100%;
  }

  body {
    font-family: ${({ theme }) => theme.fonts.medium};
    color: ${({ theme }) => theme.colors.black};
    background-color: #2B2B2B;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  #root {
    width: ${({ theme }) => theme.viewport.width};
    height: ${({ theme }) => theme.viewport.height};
    background-color: ${({ theme }) => theme.colors.white};
    overflow: hidden;
    position: relative;
  }

  img, picture, video, canvas, svg {
    display: block;
    max-width: 100%;
  }

  input, button, textarea, select {
    font: inherit;
    color: inherit;
  }

  button {
    background: none;
    border: none;
    cursor: pointer;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  ul, ol {
    list-style: none;
  }
`;
