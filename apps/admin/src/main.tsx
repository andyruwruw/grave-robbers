// Packages
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@halloween/ui/styles/arw.css';
import '@halloween/ui/styles/game.css';

// Local Imports
import AdminPage from './admin-page';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AdminPage />
  </StrictMode>,
);
