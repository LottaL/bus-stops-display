import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  // StrictMode is enabled to help detect potential problems in
  // React components during development (double-invocation of
  // lifecycle methods, deprecated APIs, etc.).
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
