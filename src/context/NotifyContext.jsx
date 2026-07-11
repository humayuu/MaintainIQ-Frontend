import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Snackbar, Alert } from '@mui/material';

const NotifyContext = createContext(null);

/**
 * App-wide toast notifications. Wrap the app once, then call useNotify()
 * anywhere: notify.success('Saved'), notify.error('Something failed'), etc.
 */
export function NotifyProvider({ children }) {
  const [state, setState] = useState({ open: false, message: '', severity: 'info' });

  const notify = useCallback((message, severity = 'info') => {
    setState({ open: true, message, severity });
  }, []);

  const handleClose = useCallback((_event, reason) => {
    if (reason === 'clickaway') return;
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  const value = useMemo(
    () => ({
      notify,
      success: (message) => notify(message, 'success'),
      error: (message) => notify(message, 'error'),
      info: (message) => notify(message, 'info'),
      warning: (message) => notify(message, 'warning'),
    }),
    [notify],
  );

  return (
    <NotifyContext.Provider value={value}>
      {children}
      <Snackbar
        open={state.open}
        autoHideDuration={3500}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleClose}
          severity={state.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {state.message}
        </Alert>
      </Snackbar>
    </NotifyContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotify() {
  const ctx = useContext(NotifyContext);
  if (ctx === null) {
    throw new Error('useNotify must be used within a NotifyProvider');
  }
  return ctx;
}

export default NotifyContext;
