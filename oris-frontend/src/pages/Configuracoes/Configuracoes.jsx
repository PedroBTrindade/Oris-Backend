import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usuarioAPI, authAPI } from '../../services/api';
import Layout from '../../components/Layout/Layout';
import './Configuracoes.css';

/**
 * Configurações: página de configurações do usuário.
 *
 * Seções:
 *  - Perfil:      avatar automático, nome, tipo de conta
 *  - Aparência:   alternância tema claro/escuro
 *  - Privacidade: tornar conta pública ou privada (com modal de confirmação)
 *  - Sessão:      logout com confirmação de senha
 */
export default function Configuracoes() {
  const { usuario, tema, alternarTema, atualizarUsuario, logout } = useAuth();

  // Estado do modal de privacidade
  const [modalPrivacidade, setModalPrivacidade] = useState(false);
  const [novaPrivacidade, setNovaPrivacidade] = useState(null);

  // Estado do modal de logout
  const [modalLogout, setModalLogout] = useState(false);
  const [senhaLogout, setSenhaLogout] = useState('');
  const [erroLogout, setErroLogout] = useState('');
  const [carregando, setCarregando] = useState(false);

  // --- Privacidade ---

  const abrirModalPrivacidade = (publica) => {
    setNovaPrivacidade(publica);
    setModalPrivacidade(true);
  };

  const confirmarPrivacidade = async () => {
    try {
      await usuarioAPI.alterarPrivacidade(usuario.id, novaPrivacidade);
      atualizarUsuario('contaPublica', novaPrivacidade);
      setModalPrivacidade(false);
    } catch (err) {
      alert(err.message || 'Erro ao alterar privacidade');
    }
  };

  // --- Logout ---

  const confirmarLogout = async () => {
    setErroLogout('');
    setCarregando(true);
    try {
      const res = await authAPI.validarSenha(usuario.id, senhaLogout);
      if (res.valida) {
        logout();
      } else {
        setErroLogout('Senha incorreta. Tente novamente.');
        setSenhaLogout('');
      }
    } catch {
      setErroLogout('Erro ao validar senha.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Layout>
      <div className="config">
        <div className="config-header">
          <h1 className="config-titulo">Configurações</h1>
        </div>

        {/* ── PERFIL ── */}
        <section className="config-card">
          <h2 className="config-secao-titulo">Perfil</h2>
          <div className="config-perfil">
            <div className="avatar avatar-lg config-avatar">
              {usuario.username[0].toUpperCase()}
            </div>
            <div className="config-perfil-info">
              <p className="config-perfil-nome">@{usuario.username}</p>
              <p className="config-perfil-tipo">Conta padrão</p>
              <p className="config-perfil-status">
                {usuario.contaPublica ? '🌐 Conta pública' : '🔒 Conta privada'}
              </p>
            </div>
          </div>
        </section>

        {/* ── APARÊNCIA ── */}
        <section className="config-card">
          <h2 className="config-secao-titulo">Aparência</h2>
          <div className="config-tema">
            <div className="config-tema-info">
              <p className="config-item-label">Tema atual</p>
              <p className="config-item-desc">
                {tema === 'claro' ? 'Modo claro' : 'Modo escuro'}
              </p>
            </div>
            <button className="config-tema-toggle" onClick={alternarTema}>
              {tema === 'claro' ? '🌙 Escuro' : '☀️ Claro'}
            </button>
          </div>
        </section>

        {/* ── PRIVACIDADE ── */}
        <section className="config-card">
          <h2 className="config-secao-titulo">Privacidade</h2>
          <p className="config-item-desc" style={{ marginBottom: 16 }}>
            {usuario.contaPublica
              ? 'Seus registros estão sendo exibidos no feed público.'
              : 'Seus registros são privados e não aparecem no feed.'}
          </p>
          {usuario.contaPublica ? (
            <button
              className="config-btn-privacidade config-btn-privacidade--privado"
              onClick={() => abrirModalPrivacidade(false)}
            >
              Tornar conta privada
            </button>
          ) : (
            <button
              className="config-btn-privacidade config-btn-privacidade--publico"
              onClick={() => abrirModalPrivacidade(true)}
            >
              Tornar conta pública
            </button>
          )}
        </section>

        {/* ── SESSÃO ── */}
        <section className="config-card">
          <h2 className="config-secao-titulo">Sessão</h2>
          <p className="config-item-desc" style={{ marginBottom: 16 }}>
            Encerrar a sessão atual do sistema.
          </p>
          <button className="config-btn-logout" onClick={() => setModalLogout(true)}>
            Fazer logout
          </button>
        </section>
      </div>

      {/* ── MODAL PRIVACIDADE ── */}
      {modalPrivacidade && (
        <div className="config-modal-overlay" onClick={() => setModalPrivacidade(false)}>
          <div className="config-modal" onClick={e => e.stopPropagation()}>
            <h3 className="config-modal-titulo">Alterar privacidade</h3>
            <p className="config-modal-texto">
              {novaPrivacidade
                ? 'Ao deixar sua conta pública, qualquer usuário poderá visualizar seus próximos relatos.'
                : 'Ao deixar sua conta privada, seus próximos relatos deixarão de ser exibidos publicamente.'}
            </p>
            <div className="config-modal-botoes">
              <button className="config-modal-cancelar" onClick={() => setModalPrivacidade(false)}>
                Cancelar
              </button>
              <button className="config-modal-confirmar" onClick={confirmarPrivacidade}>
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL LOGOUT ── */}
      {modalLogout && (
        <div className="config-modal-overlay" onClick={() => { setModalLogout(false); setSenhaLogout(''); setErroLogout(''); }}>
          <div className="config-modal" onClick={e => e.stopPropagation()}>
            <h3 className="config-modal-titulo">Confirmar saída</h3>
            <p className="config-modal-texto">
              Digite sua senha para confirmar a saída da conta.
            </p>
            <input
              type="password"
              className="config-modal-input"
              placeholder="••••••••"
              value={senhaLogout}
              onChange={e => setSenhaLogout(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && confirmarLogout()}
            />
            {erroLogout && <p className="config-modal-erro">{erroLogout}</p>}
            <div className="config-modal-botoes">
              <button className="config-modal-cancelar" onClick={() => { setModalLogout(false); setSenhaLogout(''); setErroLogout(''); }}>
                Cancelar
              </button>
              <button
                className="config-modal-sair"
                onClick={confirmarLogout}
                disabled={carregando || !senhaLogout}
              >
                {carregando ? 'Verificando...' : 'Sair'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
