import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { registroAPI } from '../../services/api';
import { EMOCOES } from '../../services/constantes';
import Layout from '../../components/Layout/Layout';
import ModalRegistro from './ModalRegistro';
import CardFeed from './CardFeed';
import './Home.css';

/**
 * Home: página principal do ORIS após login.
 *
 * Seções:
 *  1. Header com saudação
 *  2. Seletor de emoções (5 botões com emoji ao hover)
 *  3. Feed público (registros de outros usuários)
 *
 * Ao clicar em uma emoção → abre ModalRegistro.
 * Após salvar → recarrega o feed.
 */
export default function Home() {
  const { usuario } = useAuth();

  const [emocaoSelecionada, setEmocaoSelecionada] = useState(null);
  const [emocaoHover, setEmocaoHover] = useState(null);
  const [modalAberta, setModalAberta] = useState(false);
  const [feed, setFeed] = useState([]);
  const [carregandoFeed, setCarregandoFeed] = useState(true);

  // Carrega o feed público ao montar o componente
  useEffect(() => {
    carregarFeed();
  }, []);

  const carregarFeed = async () => {
    try {
      setCarregandoFeed(true);
      const dados = await registroAPI.getFeed(usuario.id);
      setFeed(dados);
    } catch {
      // Falha silenciosa — feed fica vazio
    } finally {
      setCarregandoFeed(false);
    }
  };

  const handleClicarEmocao = (emocao) => {
    setEmocaoSelecionada(emocao);
    setModalAberta(true);
  };

  const handleFecharModal = () => {
    setModalAberta(false);
    setEmocaoSelecionada(null);
  };

  const handleRegistroSalvo = () => {
    handleFecharModal();
    carregarFeed(); // Atualiza o feed após novo registro
  };

  // Calcula a hora do dia para a saudação
  const getSaudacao = () => {
    const hora = new Date().getHours();
    if (hora < 12) return 'Bom dia';
    if (hora < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <Layout>
      <div className="home">
        {/* Header da Home */}
        <div className="home-header">
          <div className="home-header-texto">
            <h2 className="home-saudacao">{getSaudacao()},</h2>
            <h1 className="home-username">@{usuario.username}</h1>
          </div>
          <div className="home-avatar avatar avatar-lg">
            {usuario.username[0].toUpperCase()}
          </div>
        </div>

        {/* Pergunta de emoção */}
        <div className="home-pergunta">
          <p>Como você se sente agora?</p>
        </div>

        {/* Seletor de emoções */}
        <div className="home-emocoes">
          {EMOCOES.map((emocao) => {
            const estaHover = emocaoHover === emocao.valor;
            return (
              <button
                key={emocao.valor}
                className="home-emocao-btn"
                style={{
                  '--cor-emocao': emocao.cor,
                  '--cor-fundo': emocao.corFundo,
                  '--cor-borda': emocao.corBorda,
                }}
                onMouseEnter={() => setEmocaoHover(emocao.valor)}
                onMouseLeave={() => setEmocaoHover(null)}
                onClick={() => handleClicarEmocao(emocao)}
              >
                <span className={`home-emocao-emoji ${estaHover ? 'home-emocao-emoji--destaque' : ''}`}>
                  {emocao.emoji}
                </span>
                <span className="home-emocao-label">{emocao.label}</span>
              </button>
            );
          })}
        </div>

        {/* Feed público */}
        <div className="home-feed">
          <h3 className="home-feed-titulo">Registros recentes</h3>

          {carregandoFeed ? (
            <div className="home-feed-loading">Carregando...</div>
          ) : feed.length === 0 ? (
            <div className="home-feed-vazio">
              <p>Nenhum registro público por enquanto.</p>
              <p>Seja o primeiro a compartilhar!</p>
            </div>
          ) : (
            <div className="home-feed-lista">
              {feed.map((registro) => (
                <CardFeed
                  key={registro.id}
                  registro={registro}
                  onReagir={carregarFeed}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de registro emocional */}
      {modalAberta && emocaoSelecionada && (
        <ModalRegistro
          emocao={emocaoSelecionada}
          usuarioId={usuario.id}
          onSalvar={handleRegistroSalvo}
          onCancelar={handleFecharModal}
        />
      )}
    </Layout>
  );
}
