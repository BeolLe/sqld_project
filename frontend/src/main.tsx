import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import App from './App';
import { initAmplitude } from './utils/eventLogger';
import { initLogTransport } from './logging';

initAmplitude();
initLogTransport();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
