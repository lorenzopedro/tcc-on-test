import React from 'react';
import { createRoot } from 'react-dom/client'; // Importação correta para React 18+
import App from './App';

// 1. Encontre o elemento raiz
const container = document.getElementById('root');

// 2. Crie a raiz
const root = createRoot(container);

// 3. Renderize o app
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);