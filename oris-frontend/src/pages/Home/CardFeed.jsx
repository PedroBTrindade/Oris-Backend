import React, { useState } from 'react';
import { registroAPI } from '../../services/api';
import { EMOCAO_MAP, REACOES } from '../../services/constantes';
import './CardFeed.css';

/**
 * CardFeed: exibe um registro emocional público no feed da Home.
 *
 * Mostra: avatar, nome, emoção, emoji, tags, descrição, data e reações.
 * Reações disponíveis: 💛 Apoiar, 🥹 Emocionar-se, 🎉 Celebrar.
 */
export default function CardFeed({ registro, onReagir }) {
  const [reagindo, setReagindo] = useState(false);

  // Busca os dados visuais da emoção a partir do mapa de constantes
  const emocaoDados = EMOCAO_MAP[registro.emocao] || {};

  // Converte string de tags "triste,cansado" em array
  const tags = registro.tags
    ? registro.tags.split(',').map(t => t.trim()).filter(Boolean)
    : [];

  // Formata a data de forma amigável
  const formatarData = (isoString) => {
    const data = new Date(isoString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleReacao = async (tipo) => {
    if (reagindo) return;
    setReagindo(true);
    try {
      await registroAPI.reagir(registro.id, tipo);
      onReagir(); // Recarrega o feed para atualizar contagem
    } catch {
      // Falha silenciosa
    } finally {
      setReagindo(false);
    }
  };

  return (
    <div
      className="card-feed"
      style={{
        '--cor-emocao': emocaoDados.cor,
        '--cor-fundo': emocaoDados.corFundo,
        '--cor-borda': emocaoDados.corBorda,
      }}
    >
      {/* Linha superior: avatar + nome + emoção + data */}
      <div className="card-feed-topo">
        <div className="avatar card-feed-avatar">
          {registro.username?.[0]?.toUpperCase() || '?'}
        </div>

        <div className="card-feed-info">
          <span className="card-feed-nome">@{registro.username}</span>
          <span className="card-feed-data">{formatarData(registro.registradoEm)}</span>
        </div>

        <div className="card-feed-emocao">
          <span className="card-feed-emoji">{emocaoDados.emoji}</span>
          <span className="card-feed-emocao-label">{emocaoDados.label}</span>
        </div>
      </div>

      {/* Descrição */}
      {registro.descricao && (
        <p className="card-feed-descricao">{registro.descricao}</p>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="card-feed-tags">
          {tags.map(tag => (
            <span key={tag} className="card-feed-tag">{tag}</span>
          ))}
        </div>
      )}

      {/* Reações */}
      <div className="card-feed-reacoes">
        {REACOES.map(reacao => {
          const contagem =
            reacao.tipo === 'APOIAR'    ? registro.reacaoApoiar :
            reacao.tipo === 'EMOCIONAR' ? registro.reacaoEmocionar :
                                          registro.reacaoCelebrar;
          return (
            <button
              key={reacao.tipo}
              className="card-feed-reacao-btn"
              onClick={() => handleReacao(reacao.tipo)}
              disabled={reagindo}
              title={reacao.label}
            >
              <span className="card-feed-reacao-emoji">{reacao.emoji}</span>
              {contagem > 0 && (
                <span className="card-feed-reacao-count">{contagem}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
