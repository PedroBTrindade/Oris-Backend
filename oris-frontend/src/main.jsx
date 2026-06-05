import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Ponto de entrada da aplicação ORIS no Vite.
// Monta o componente raiz <App /> dentro do div#root do index.html
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
