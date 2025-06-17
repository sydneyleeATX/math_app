import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Assumes App.tsx is also in src/ or path is adjusted

console.log('[DEBUG] index.tsx file loaded');

// Register Service Worker for PWA capabilities
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('[DEBUG] ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch((error) => {
        console.log('[DEBUG] ServiceWorker registration failed: ', error);
      });
  });
}

const rootElement = document.getElementById('root');
console.log('[DEBUG] Got rootElement:', rootElement);
if (!rootElement) {
  document.body.innerHTML = '<div style="color:red;padding:2rem;font-size:1.5rem">[DEBUG] Could not find root element to mount to</div>';
  throw new Error('[DEBUG] Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
console.log('[DEBUG] ReactDOM root created');
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
console.log('[DEBUG] ReactDOM render called');