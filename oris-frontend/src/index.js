import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * index.js: ponto de entrada da aplicação ORIS.
 *
 * Monta o componente raiz <App /> dentro do elemento
 * com id="root" definido no public/index.html.
 *
 * React.StrictMode ativa verificações extras em desenvolvimento
 * (detecta efeitos colaterais e APIs obsoletas).
 */
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
