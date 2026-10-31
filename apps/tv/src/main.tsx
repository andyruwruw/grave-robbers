// Packages
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import CrashReload from '@halloween/ui/components/layout/crash-reload';
import '@halloween/ui/styles/arw.css';
import '@halloween/ui/styles/game.css';

// Local Imports
import DisplayPage from './display-page';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CrashReload>
      <DisplayPage />
    </CrashReload>
  </StrictMode>,
);
