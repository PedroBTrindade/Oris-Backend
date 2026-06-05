import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import './Login.css';

/**
 * Login: tela de entrada do ORIS.
 *
 * Exibe logo estrela + nome ORIS + formulário de login.
 * Em caso de erro, limpa os campos e exibe alerta.
 * Link "não possuo conta" redireciona para cadastro.
 */
export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const usuario = await authAPI.login(username, senha);
      login(usuario);

      // Admin vai para o painel, usuário vai para home
      navigate(usuario.admin ? '/admin' : '/home');
    } catch (err) {
      // Limpa os dois campos em caso de erro
      setUsername('');
      setSenha('');
      setErro(err.message || 'senha ou nome de usuário são incompatíveis');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="login-pagina">
      {/* Fundo com gradiente e efeitos de brilho */}
      <div className="login-brilho login-brilho-1" />
      <div className="login-brilho login-brilho-2" />

      <div className="login-container">
        {/* Logo e identidade */}
        <div className="login-logo">
          <div className="login-estrela">
            <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="estrelaGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#67E8F9"/>
                  <stop offset="50%" stopColor="#A78BFA"/>
                  <stop offset="100%" stopColor="#8B5CF6"/>
                </radialGradient>
                <filter id="brilho">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              <polygon
                points="30,5 36,22 54,22 40,34 45,52 30,42 15,52 20,34 6,22 24,22"
                fill="url(#estrelaGrad)"
                filter="url(#brilho)"
                opacity="0.95"
              />
            </svg>
          </div>
          <h1 className="login-titulo">ORIS</h1>
          <p className="login-subtitulo">Expresse suas emoções</p>
        </div>

        {/* Formulário */}
        <form className="login-form" onSubmit={handleLogin}>
          {/* Mensagem de erro */}
          {erro && (
            <div className="login-erro">
              {erro}
            </div>
          )}

          <div className="login-campo">
            <label className="login-label">Nome de usuário</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="@seuusuario"
              className="login-input"
              required
            />
          </div>

          <div className="login-campo">
            <label className="login-label">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              className="login-input"
              required
            />
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={carregando}
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Link para cadastro */}
        <button
          className="login-cadastro-link"
          onClick={() => navigate('/cadastro')}
        >
          não possuo conta
        </button>
      </div>
    </div>
  );
}
