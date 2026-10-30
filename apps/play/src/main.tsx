// Packages
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@halloween/ui/styles/arw.css';
import '@halloween/ui/styles/game.css';

// Local Imports
import PlayPage from './play-page';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PlayPage />
  </StrictMode>,
);
