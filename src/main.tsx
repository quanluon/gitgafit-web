import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './i18n/config';
import { indexedDBService } from './services/indexeddb';

// Initialize IndexedDB
indexedDBService.init().catch(console.error);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

