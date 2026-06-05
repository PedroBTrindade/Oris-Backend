import React from 'react';
import Footer from '../Footer/Footer';
import './Layout.css';

/**
 * Layout: componente wrapper para todas as páginas internas do usuário.
 *
 * Adiciona:
 *  - Padding inferior para não cobrir o footer fixo
 *  - Footer de navegação fixo
 *
 * Uso: <Layout><Home /></Layout>
 */
export default function Layout({ children }) {
  return (
    <div className="layout">
      <main className="layout-conteudo">
        {children}
      </main>
      <Footer />
    </div>
  );
}
