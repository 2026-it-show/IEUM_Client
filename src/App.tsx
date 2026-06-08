import { ThemeProvider } from 'styled-components';
import { GlobalStyle, theme } from '@/styles';
import { BusinessCardPage } from '@/pages';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <BusinessCardPage />
    </ThemeProvider>
  );
}

export default App;
