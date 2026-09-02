import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router/AppRouter.jsx';
import AppLoader from './components/shared/AppLoader.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { WorkbookProvider } from './context/WorkbookContext.jsx';
import { AdsProvider } from './context/AdsContext.jsx';

export default function App() {
  return (
    <AppLoader>
      <BrowserRouter>
        <AuthProvider>
          <AdsProvider>
            <WorkbookProvider>
              <AppRouter />
            </WorkbookProvider>
          </AdsProvider>
        </AuthProvider>
      </BrowserRouter>
    </AppLoader>
  );
}
