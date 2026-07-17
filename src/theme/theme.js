import { createTheme, alpha } from '@mui/material/styles';

/**
 * MaintainIQ design system.
 *
 * A calm, professional "operations console" look: a trustworthy corporate
 * blue primary with a teal accent, generous radii and layered shadows.
 *
 * `createAppTheme(mode)` builds either the light or dark variant so the app can
 * switch at runtime (see ColorModeProvider). All surface-dependent component
 * overrides read from the mode below rather than hardcoding white.
 */

const PRIMARY = {
  main: '#1565C0',
  light: '#4E8FE0',
  dark: '#0D47A1',
  contrastText: '#FFFFFF',
};

const SECONDARY = {
  main: '#0EA5A5',
  light: '#5EE0DD',
  dark: '#0B7C7C',
  contrastText: '#FFFFFF',
};

// Neutral slate ramp used for surfaces, borders and text.
const NEUTRAL = {
  25: '#FBFCFE',
  50: '#F5F7FA',
  100: '#EEF2F7',
  200: '#E3E9F0',
  300: '#CFD8E3',
  500: '#64748B',
  700: '#334155',
  900: '#0F172A',
};

// Soft, layered shadow scale (index === MUI elevation).
const shadow = (y, blur, spread, a) =>
  `0px ${y}px ${blur}px ${spread}px ${alpha('#0F172A', a)}`;

const SHADOWS = [
  'none',
  shadow(1, 2, 0, 0.04),
  shadow(1, 3, 0, 0.06),
  shadow(2, 6, -1, 0.08),
  shadow(4, 10, -2, 0.08),
  shadow(6, 14, -3, 0.1),
  shadow(8, 18, -4, 0.1),
  shadow(10, 22, -5, 0.12),
  shadow(12, 26, -6, 0.12),
  shadow(14, 30, -7, 0.14),
  shadow(16, 34, -8, 0.14),
  shadow(18, 38, -9, 0.16),
  shadow(20, 42, -10, 0.16),
  shadow(22, 46, -11, 0.18),
  shadow(24, 50, -12, 0.18),
  shadow(26, 54, -13, 0.2),
  shadow(28, 58, -14, 0.2),
  shadow(30, 62, -15, 0.22),
  shadow(32, 66, -16, 0.22),
  shadow(34, 70, -17, 0.24),
  shadow(36, 74, -18, 0.24),
  shadow(38, 78, -19, 0.26),
  shadow(40, 82, -20, 0.26),
  shadow(42, 86, -21, 0.28),
  shadow(44, 90, -22, 0.28),
];

/**
 * Build the MaintainIQ theme for a given palette mode ('light' | 'dark').
 */
export function createAppTheme(mode = 'light') {
  const isDark = mode === 'dark';

  // Primary reads a touch lighter on a dark canvas for contrast.
  const primary = isDark ? { ...PRIMARY, main: '#5B9BE5', dark: '#1565C0' } : PRIMARY;

  const background = isDark
    ? { default: '#0B1220', paper: '#111B2E' }
    : { default: NEUTRAL[50], paper: '#FFFFFF' };
  const text = isDark
    ? { primary: '#E8EEF6', secondary: '#93A3B8' }
    : { primary: NEUTRAL[900], secondary: NEUTRAL[500] };
  const divider = isDark ? 'rgba(148,163,184,0.20)' : NEUTRAL[200];
  const primaryMain = primary.main;

  return createTheme({
    palette: {
      mode,
      primary,
      secondary: SECONDARY,
      success: { main: '#22A053', light: isDark ? '#14351F' : '#DCFCE7', dark: '#166534' },
      warning: { main: '#D97A0B', light: isDark ? '#3A2A0A' : '#FEF3C7', dark: '#92400E' },
      error: { main: '#EF4444', light: isDark ? '#3A1A1A' : '#FEE2E2', dark: '#B91C1C' },
      info: { main: '#2E90CF', light: isDark ? '#0C2A3A' : '#E0F2FE', dark: '#075985' },
      background,
      text,
      divider,
      neutral: NEUTRAL,
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: [
        'Inter',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      h1: { fontWeight: 800, letterSpacing: '-0.02em' },
      h2: { fontWeight: 800, letterSpacing: '-0.02em' },
      h3: { fontWeight: 700, letterSpacing: '-0.02em' },
      h4: { fontWeight: 700, letterSpacing: '-0.015em' },
      h5: { fontWeight: 700, letterSpacing: '-0.01em' },
      h6: { fontWeight: 700, letterSpacing: '-0.01em' },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600 },
      button: { fontWeight: 600, textTransform: 'none', letterSpacing: 0 },
      overline: { fontWeight: 700, letterSpacing: '0.08em' },
    },
    shadows: SHADOWS,
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { backgroundColor: background.default },
          '*::-webkit-scrollbar': { width: 10, height: 10 },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: isDark ? '#2A3B52' : NEUTRAL[300],
            borderRadius: 8,
            border: `2px solid ${background.default}`,
          },
          '*::-webkit-scrollbar-thumb:hover': {
            backgroundColor: isDark ? '#3A4E68' : NEUTRAL[500],
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 10, paddingInline: 18 },
          sizeLarge: { paddingBlock: 10 },
          containedPrimary: {
            boxShadow: `0 1px 2px ${alpha(PRIMARY.dark, 0.24)}`,
            '&:hover': { boxShadow: `0 4px 12px ${alpha(PRIMARY.dark, 0.28)}` },
          },
        },
      },
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: 'none' } },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            border: `1px solid ${divider}`,
            borderRadius: 16,
            boxShadow: shadow(1, 2, 0, isDark ? 0.3 : 0.04),
          },
        },
      },
      MuiCardHeader: {
        styleOverrides: {
          root: { paddingBottom: 8 },
          title: { fontSize: '1.05rem', fontWeight: 700 },
          subheader: { fontSize: '0.8rem' },
        },
      },
      MuiAppBar: {
        defaultProps: { color: 'inherit', elevation: 0 },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600, borderRadius: 8 },
          sizeSmall: { height: 24 },
        },
      },
      MuiTextField: {
        defaultProps: { size: 'small' },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: { borderRadius: 10, backgroundColor: background.paper },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: { fontWeight: 700, color: text.secondary },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: isDark ? '#334155' : NEUTRAL[900],
            fontSize: '0.75rem',
            borderRadius: 8,
            padding: '6px 10px',
          },
          arrow: { color: isDark ? '#334155' : NEUTRAL[900] },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            '&.Mui-selected': {
              backgroundColor: alpha(primaryMain, isDark ? 0.22 : 0.12),
              '&:hover': { backgroundColor: alpha(primaryMain, isDark ? 0.3 : 0.18) },
            },
          },
        },
      },
      MuiLink: {
        defaultProps: { underline: 'hover' },
        styleOverrides: { root: { fontWeight: 600 } },
      },
    },
  });
}

// Default (light) theme for any non-runtime consumers.
const theme = createAppTheme('light');

export default theme;
