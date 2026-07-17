import { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createAppTheme } from './theme';

const ColorModeContext = createContext({ mode: 'light', toggleColorMode: () => {} });

// Initial mode: an explicit saved choice wins; otherwise follow the OS setting.
const getInitialMode = () => {
  try {
    const stored = localStorage.getItem('colorMode');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* localStorage unavailable — fall through */
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/**
 * Wraps the app in an MUI ThemeProvider whose palette mode (light/dark) is
 * toggleable at runtime and persisted to localStorage. Also mounts CssBaseline
 * so the body background follows the active theme.
 */
export function ColorModeProvider({ children }) {
  const [mode, setMode] = useState(getInitialMode);

  const toggleColorMode = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('colorMode', next);
      } catch {
        /* ignore persistence failures */
      }
      return next;
    });
  }, []);

  const theme = useMemo(() => createAppTheme(mode), [mode]);
  const value = useMemo(() => ({ mode, toggleColorMode }), [mode, toggleColorMode]);

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useColorMode() {
  return useContext(ColorModeContext);
}
