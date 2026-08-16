import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router/AppRouter.jsx';
import AppLoader from './components/shared/AppLoader.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { WorkbookProvider } from './context/WorkbookContext.jsx';

export default function App() {
  return (
    <AppLoader>
      <BrowserRouter>
        <AuthProvider>
          <WorkbookProvider>
            <AppRouter />
          </WorkbookProvider>
        </AuthProvider>
      </BrowserRouter>
    </AppLoader>
  );
}
