import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { store } from './store/store';
import App from './App';

// 创建心理健康主题
const theme = createTheme({
  palette: {
    primary: {
      main: '#6B73FF', // 舒缓的蓝紫色
      light: '#9C9EFF',
      dark: '#3F4CDB',
    },
    secondary: {
      main: '#FF6B9D', // 温暖的粉色
      light: '#FFB1C5',
      dark: '#E91E63',
    },
    background: {
      default: '#F8F9FF',
      paper: '#FFFFFF',
    },
    success: {
      main: '#4CAF50',
    },
    warning: {
      main: '#FF9800',
    },
    error: {
      main: '#F44336',
    },
    text: {
      primary: '#2D3748',
      secondary: '#718096',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      color: '#2D3748',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#2D3748',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 500,
      color: '#2D3748',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#4A5568',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontSize: '1rem',
          fontWeight: 500,
          padding: '12px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(107, 115, 255, 0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
          border: '1px solid #E2E8F0',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          fontSize: '0.875rem',
        },
      },
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);