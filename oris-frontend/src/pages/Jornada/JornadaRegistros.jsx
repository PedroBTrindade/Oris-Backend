import React, { useState } from 'react';
import { EMOCAO_MAP } from '../../services/constantes';
import './Jornada.css';

/**
 * JornadaRegistros: lista todos os registros emocionais do usuário.
 * Ordenados do mais recente ao mais antigo (backend já retorna assim).
 * Permite excluir registros com confirmação inline.
 */
export default function JornadaRegistros({ registros, onDeletar }) {
  const [confirmandoId, setConfirmandoId] = useState(null);

  const formatarData = (iso) => {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  if (registros.length === 0) {
    return (
      <div className="jornada-vazio">
        <p>Nenhum registro ainda.</p>
        <p>Volte à Home e registre como está se sentindo!</p>
      </div>
    );
  }

  return (
    <div className="jornada-lista">
      {registros.map(registro => {
        const emocao = EMOCAO_MAP[registro.emocao] || {};
        const tags = registro.tags
          ? registro.tags.split(',').map(t => t.trim()).filter(Boolean)
          : [];
        const confirmando = confirmandoId === registro.id;

        return (
          <div
            key={registro.id}
            className="jornada-card"
            style={{
              '--cor-emocao': emocao.cor,
              '--cor-fundo': emocao.corFundo,
              '--cor-borda': emocao.corBorda,
            }}
          >
            {/* Topo: emoji + emoção + data + botão deletar */}
            <div className="jornada-card-topo">
              <span className="jornada-card-emoji">{emocao.emoji}</span>
              <div className="jornada-card-info">
                <span className="jornada-card-emocao">{emocao.label}</span>
                <span className="jornada-card-data">{formatarData(registro.registradoEm)}</span>
              </div>
              {registro.publico && (
                <span className="jornada-card-publico">público</span>
              )}
              {!confirmando ? (
                <button
                  className="jornada-card-deletar"
                  onClick={() => setConfirmandoId(registro.id)}
                  title="Excluir registro"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                  </svg>
                </button>
              ) : (
                <div className="jornada-confirmar">
                  <span>Excluir?</span>
                  <button className="jornada-confirmar-sim" onClick={() => { onDeletar(registro.id); setConfirmandoId(null); }}>Sim</button>
                  <button className="jornada-confirmar-nao" onClick={() => setConfirmandoId(null)}>Não</button>
                </div>
              )}
            </div>

            {/* Descrição */}
            {registro.descricao && (
              <p className="jornada-card-descricao">{registro.descricao}</p>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="jornada-card-tags">
                {tags.map(tag => (
                  <span key={tag} className="jornada-card-tag">{tag}</span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
