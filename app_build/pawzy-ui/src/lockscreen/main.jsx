import React from 'react';
import ReactDOM from 'react-dom/client';
import { LockScreen } from './LockScreen';
import { AppStateProvider } from '../hooks/useAppState';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppStateProvider>
      <LockScreen />
    </AppStateProvider>
  </React.StrictMode>
);
