// Packages
import React from 'react';
import {
  Route,
  Routes,
} from 'react-router-dom';

// Local Imports
import AdminPage from './pages/admin/admin-page';
import ControllerPage from './pages/controller/controller-page';
import DisplayPage from './pages/display/display-page';

/**
 * Route table: phones land on `/`, the TV opens `/tv`, and `/admin` has
 * the TV's controls on their own.
 *
 * @returns {React.JSX.Element} The routed app.
 */
function App(): React.JSX.Element {
  return (
    <Routes>
      <Route
        path='/'
        element={<ControllerPage />} />
      <Route
        path='/tv'
        element={<DisplayPage />} />
      <Route
        path='/admin'
        element={<AdminPage />} />
    </Routes>
  );
}

export default App;
