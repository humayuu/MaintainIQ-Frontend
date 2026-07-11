import { createTheme, alpha } from '@mui/material/styles';

/**
 * MaintainIQ design system.
 *
 * A calm, professional "operations console" look: a trustworthy corporate
 * blue primary with a teal accent, a soft neutral canvas, generous radii and
 * layered, low-contrast shadows. Deliberately avoids MUI's default purple.
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

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: PRIMARY,
    secondary: SECONDARY,
    success: { main: '#15803D', light: '#DCFCE7', dark: '#166534' },
    warning: { main: '#B45309', light: '#FEF3C7', dark: '#92400E' },
    error: { main: '#DC2626', light: '#FEE2E2', dark: '#B91C1C' },
    info: { main: '#0369A1', light: '#E0F2FE', dark: '#075985' },
    background: {
      default: NEUTRAL[50],
      paper: '#FFFFFF',
    },
    text: {
      primary: NEUTRAL[900],
      secondary: NEUTRAL[500],
    },
    divider: NEUTRAL[200],
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
  shadows: [
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
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: NEUTRAL[50] },
        '*::-webkit-scrollbar': { width: 10, height: 10 },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: NEUTRAL[300],
          borderRadius: 8,
          border: `2px solid ${NEUTRAL[50]}`,
        },
        '*::-webkit-scrollbar-thumb:hover': { backgroundColor: NEUTRAL[500] },
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
          border: `1px solid ${NEUTRAL[200]}`,
          borderRadius: 16,
          boxShadow: shadow(1, 2, 0, 0.04),
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
        root: { borderRadius: 10, backgroundColor: '#FFFFFF' },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 700, color: NEUTRAL[500] },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: NEUTRAL[900],
          fontSize: '0.75rem',
          borderRadius: 8,
          padding: '6px 10px',
        },
        arrow: { color: NEUTRAL[900] },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          '&.Mui-selected': {
            backgroundColor: alpha(PRIMARY.main, 0.12),
            '&:hover': { backgroundColor: alpha(PRIMARY.main, 0.18) },
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

export default theme;
