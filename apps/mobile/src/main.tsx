// Packages
import { createRoot } from 'react-dom/client';
import CrashReload from '@halloween/ui/components/layout/crash-reload';
import { StrictMode } from 'react';

// Styles
import '@halloween/ui/styles/arw.css';
import '@halloween/ui/styles/game.css';

// Local Imports
import ControllerPage from './controller-page';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CrashReload>
      <ControllerPage />
    </CrashReload>
  </StrictMode>,
);
