import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Footer.css';

/**
 * Footer: barra de navegação fixa inferior para usuários comuns.
 *
 * Exibe 3 abas: Home, Jornada, Configurações.
 * A aba ativa recebe destaque visual (tom levemente mais claro).
 * Sem emojis nos botões — apenas ícones SVG simples.
 */
export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  const abas = [
    {
      rota: '/home',
      label: 'Home',
      icone: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
    },
    {
      rota: '/jornada',
      label: 'Jornada',
      icone: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
    },
    {
      rota: '/configuracoes',
      label: 'Configurações',
      icone: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
        </svg>
      ),
    },
  ];

  return (
    <footer className="footer">
      {abas.map((aba) => {
        const ativa = location.pathname === aba.rota;
        return (
          <button
            key={aba.rota}
            className={`footer-aba ${ativa ? 'footer-aba--ativa' : ''}`}
            onClick={() => navigate(aba.rota)}
          >
            <span className="footer-icone">{aba.icone}</span>
            <span className="footer-label">{aba.label}</span>
          </button>
        );
      })}
    </footer>
  );
}
