import React from 'react';
import './Jornada.css';

/**
 * JornadaAtividade: exibe estatísticas de uso do sistema pelo usuário.
 * Dados fornecidos pelo backend via /api/registros/atividade/{userId}.
 */
export default function JornadaAtividade({ atividade }) {
  const cards = [
    {
      label: 'Total de registros',
      valor: atividade.totalRegistros ?? 0,
      icone: '📋',
      descricao: 'desde o início',
    },
    {
      label: 'Nesta semana',
      valor: atividade.registrosSemana ?? 0,
      icone: '📅',
      descricao: 'últimos 7 dias',
    },
    {
      label: 'Neste mês',
      valor: atividade.registrosMes ?? 0,
      icone: '📆',
      descricao: 'últimos 30 dias',
    },
    {
      label: 'Dias ativos',
      valor: atividade.diasAtivos ?? 0,
      icone: '🔥',
      descricao: 'na última semana',
    },
  ];

  return (
    <div className="atividade-grid">
      {cards.map(card => (
        <div key={card.label} className="atividade-card">
          <span className="atividade-icone">{card.icone}</span>
          <span className="atividade-valor">{card.valor}</span>
          <span className="atividade-label">{card.label}</span>
          <span className="atividade-descricao">{card.descricao}</span>
        </div>
      ))}
    </div>
  );
}
