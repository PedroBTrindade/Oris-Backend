import React, { useState } from 'react';
import { registroAPI } from '../../services/api';
import { TAGS_POR_EMOCAO } from '../../services/constantes';
import './ModalRegistro.css';

/**
 * ModalRegistro: modal exibido ao clicar em uma emoção na Home.
 *
 * Permite ao usuário:
 *  - Ver as tags sugeridas para a emoção selecionada
 *  - Selecionar uma ou mais tags
 *  - Escrever uma descrição opcional
 *  - Salvar ou cancelar o registro
 */
export default function ModalRegistro({ emocao, usuarioId, onSalvar, onCancelar }) {
  const [tagsSelecionadas, setTagsSelecionadas] = useState([]);
  const [descricao, setDescricao] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const tagsDisponiveis = TAGS_POR_EMOCAO[emocao.valor] || [];

  // Alterna seleção de uma tag
  const toggleTag = (tag) => {
    setTagsSelecionadas(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSalvar = async () => {
    setSalvando(true);
    setErro('');
    try {
      await registroAPI.criar(
        emocao.valor,
        descricao.trim() || null,
        tagsSelecionadas.join(',') || null,
        usuarioId
      );
      onSalvar();
    } catch (err) {
      setErro(err.message || 'Erro ao salvar registro');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancelar}>
      <div className="modal-caixa" onClick={e => e.stopPropagation()}>

        {/* Cabeçalho com emoção */}
        <div className="modal-header" style={{ '--cor-emocao': emocao.cor }}>
          <span className="modal-emoji">{emocao.emoji}</span>
          <div>
            <h2 className="modal-titulo">{emocao.label}</h2>
            <p className="modal-subtitulo">Como está se sentindo?</p>
          </div>
        </div>

        {/* Tags */}
        <div className="modal-secao">
          <p className="modal-secao-label">Tags</p>
          <div className="modal-tags">
            {tagsDisponiveis.map(tag => (
              <button
                key={tag}
                className={`modal-tag ${tagsSelecionadas.includes(tag) ? 'modal-tag--ativa' : ''}`}
                style={{ '--cor-emocao': emocao.cor }}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Descrição opcional */}
        <div className="modal-secao">
          <p className="modal-secao-label">Descrição <span className="modal-opcional">(opcional)</span></p>
          <textarea
            className="modal-textarea"
            placeholder="Descreva como está se sentindo..."
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            maxLength={500}
            rows={3}
          />
          <span className="modal-contador">{descricao.length}/500</span>
        </div>

        {erro && <p className="modal-erro">{erro}</p>}

        {/* Botões */}
        <div className="modal-botoes">
          <button className="modal-btn-cancelar" onClick={onCancelar}>
            Cancelar
          </button>
          <button
            className="modal-btn-salvar"
            style={{ '--cor-emocao': emocao.cor }}
            onClick={handleSalvar}
            disabled={salvando}
          >
            {salvando ? 'Salvando...' : 'Registrar'}
          </button>
        </div>

      </div>
    </div>
  );
}
