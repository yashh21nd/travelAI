import { createTheme } from '@mui/material/styles';

// Professional Travel Planner Color Palette
const brandColors = {
  primary: {
    main: '#1976D2', // Professional Blue
    dark: '#115293',
    light: '#42A5F5',
    contrastText: '#FFFFFF'
  },
  secondary: {
    main: '#FF6B35', // Travel Orange/Sunset
    dark: '#E55100',
    light: '#FF8A65',
    contrastText: '#FFFFFF'
  },
  accent: {
    gold: '#FFB300', // Premium Gold
    teal: '#00ACC1', // Travel Teal
    green: '#43A047', // Success Green
    red: '#E53935'    // Error Red
  },
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121'
  }
};

// Professional Typography Scale
const typography = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: {
    fontSize: '3.5rem',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.02em'
  },
  h2: {
    fontSize: '2.5rem',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.01em'
  },
  h3: {
    fontSize: '2rem',
    fontWeight: 600,
    lineHeight: 1.4
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 500,
    lineHeight: 1.4
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 500,
    lineHeight: 1.5
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.6
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.6,
    color: brandColors.neutral[700]
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.5,
    color: brandColors.neutral[600]
  },
  button: {
    fontSize: '0.875rem',
    fontWeight: 500,
    textTransform: 'none',
    letterSpacing: '0.01em'
  }
};

// Professional Component Styling
const components = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        padding: '10px 24px',
        fontSize: '0.875rem',
        fontWeight: 500,
        textTransform: 'none',
        boxShadow: 'none',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }
      },
      contained: {
        background: `linear-gradient(135deg, ${brandColors.primary.main} 0%, ${brandColors.primary.dark} 100%)`,
        '&:hover': {
          background: `linear-gradient(135deg, ${brandColors.primary.dark} 0%, #0D47A1 100%)`
        }
      },
      outlined: {
        borderWidth: 2,
        '&:hover': {
          borderWidth: 2,
          backgroundColor: 'rgba(25, 118, 210, 0.04)'
        }
      }
    }
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: `1px solid ${brandColors.neutral[200]}`,
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
        }
      }
    }
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 12,
          backgroundColor: brandColors.neutral[50],
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: brandColors.primary.main
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: 2
          }
        }
      }
    }
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        fontWeight: 500,
        fontSize: '0.75rem'
      },
      filled: {
        backgroundColor: brandColors.neutral[100],
        color: brandColors.neutral[800],
        '&:hover': {
          backgroundColor: brandColors.neutral[200]
        }
      }
    }
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundColor: '#FFFFFF',
        color: brandColors.neutral[900],
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        borderBottom: `1px solid ${brandColors.neutral[200]}`
      }
    }
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 12
      }
    }
  }
};

// Create Professional Theme
const theme = createTheme({
  palette: {
    primary: brandColors.primary,
    secondary: brandColors.secondary,
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF'
    },
    text: {
      primary: brandColors.neutral[900],
      secondary: brandColors.neutral[600]
    },
    divider: brandColors.neutral[200]
  },
  typography,
  components,
  shape: {
    borderRadius: 12
  },
  spacing: 8,
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.06)',
    '0 2px 6px rgba(0,0,0,0.08)',
    '0 4px 12px rgba(0,0,0,0.10)',
    '0 6px 16px rgba(0,0,0,0.12)',
    '0 8px 24px rgba(0,0,0,0.14)',
    '0 12px 32px rgba(0,0,0,0.16)',
    '0 16px 40px rgba(0,0,0,0.18)',
    '0 20px 48px rgba(0,0,0,0.20)',
    // ... continue with standard Material-UI shadows
    ...createTheme().shadows.slice(9)
  ]
});

export default theme;
export { brandColors };