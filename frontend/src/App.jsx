import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router/AppRouter.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { WorkbookProvider } from './context/WorkbookContext.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WorkbookProvider>
          <AppRouter />
        </WorkbookProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
