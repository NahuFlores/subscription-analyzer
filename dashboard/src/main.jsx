import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Suppress specific Recharts warnings that are false positives in dev
const originalError = console.error;
const originalWarn = console.warn;

const filterConsole = (args, originalFn) => {
  // Use a more generic check because the error message doesn't definitely identify "recharts" prefix
  // Message: "The width(-1) and height(-1) of chart should be greater than 0..."
  const msg = args[0];
  if (typeof msg === 'string' && msg.includes('width(-1)') && msg.includes('height(-1)')) {
    return;
  }
  originalFn(...args);
};

console.error = (...args) => filterConsole(args, originalError);
console.warn = (...args) => filterConsole(args, originalWarn);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Hide splash screen after React mounts
requestAnimationFrame(() => {
  const splash = document.getElementById('splash-screen');
  if (splash) {
    // Small delay for smoother transition
    setTimeout(() => {
      splash.classList.add('hidden');
      document.body.classList.add('app-loaded');

      // Remove splash from DOM after animation completes
      setTimeout(() => splash.remove(), 500);
    }, 300);
  }
});
