import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ColorModeProvider } from './theme/ColorModeProvider';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* ColorModeProvider mounts the (toggleable) ThemeProvider + CssBaseline */}
    <ColorModeProvider>
      <App />
    </ColorModeProvider>
  </StrictMode>,
);
