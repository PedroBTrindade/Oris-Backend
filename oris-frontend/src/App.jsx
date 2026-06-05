import React from 'react';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import './styles/global.css';

/**
 * App: componente raiz da aplicação ORIS.
 *
 * Responsabilidades:
 *  - Importar o CSS global (variáveis, reset, utilitários)
 *  - Envolver toda a árvore de componentes com AuthProvider
 *    (disponibiliza useAuth() em qualquer componente filho)
 *  - Renderizar AppRoutes que define todas as páginas e proteções
 */
export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
