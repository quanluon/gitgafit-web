import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './i18n/config';
import { indexedDBService } from './services/indexeddb';
import { errorTracking, ErrorSeverity } from './services/errorTracking';

// Initialize IndexedDB
indexedDBService.init().catch((error) => {
  errorTracking.logError(error, ErrorSeverity.MEDIUM, { source: 'indexeddb_init' });
});

// Initialize error tracking
errorTracking.init();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

