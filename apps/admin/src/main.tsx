// Packages
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import CrashReload from '@halloween/ui/components/layout/crash-reload';
import '@halloween/ui/styles/arw.css';
import '@halloween/ui/styles/game.css';

// Local Imports
import AdminPage from './admin-page';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CrashReload>
      <AdminPage />
    </CrashReload>
  </StrictMode>,
);
