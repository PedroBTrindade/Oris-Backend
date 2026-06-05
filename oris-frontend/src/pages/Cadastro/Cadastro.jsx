import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import './Cadastro.css';

/**
 * Cadastro: tela de criação de conta no ORIS.
 *
 * Validações client-side espelhadas às do backend:
 *  - Username não pode ser "admin"
 *  - Senha com mínimo 8 chars e ao menos uma letra
 *  - Confirmação deve ser igual à senha
 */
export default function Cadastro() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  // Valida senha: mínimo 8 chars com ao menos uma letra
  const senhaValida = (s) => /^(?=.*[a-zA-Z]).{8,}$/.test(s);

  const handleCadastro = async (e) => {
    e.preventDefault();
    const novosErros = {};

    // Validação client-side da senha
    if (!senhaValida(senha)) {
      novosErros.senha = 'a senha deve possuir no mínimo 8 caracteres com a presença de ao menos uma letra';
      setConfirmacao('');
    }

    // Validação client-side da confirmação
    if (senhaValida(senha) && senha !== confirmacao) {
      novosErros.confirmacao = 'A senha e a confirmação de senha devem ser iguais';
    }

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    setErros({});
    setCarregando(true);

    try {
      await authAPI.cadastrar(username, senha, confirmacao);
      setSucesso(true);

      // Redireciona para login após 1.5s
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const msg = err.message || 'Erro ao cadastrar';

      if (msg.includes('usuário') || msg.includes('registrado')) {
        setErros({ username: 'Nome de usuário já foi registrado' });
      } else if (msg.includes('senha')) {
        setErros({ senha: msg });
        setConfirmacao('');
      } else {
        setErros({ geral: msg });
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="cadastro-pagina">
      <div className="cadastro-brilho cadastro-brilho-1" />
      <div className="cadastro-brilho cadastro-brilho-2" />

      <div className="cadastro-container">
        {/* Header */}
        <div className="cadastro-header">
          <button className="cadastro-voltar" onClick={() => navigate('/login')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>

          <div className="cadastro-logo">
            <svg viewBox="0 0 40 40" fill="none">
              <defs>
                <radialGradient id="eGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#67E8F9"/>
                  <stop offset="100%" stopColor="#8B5CF6"/>
                </radialGradient>
              </defs>
              <polygon
                points="20,3 24,14 36,14 27,22 30,34 20,28 10,34 13,22 4,14 16,14"
                fill="url(#eGrad)"
              />
            </svg>
          </div>

          <h1 className="cadastro-titulo">Criar conta</h1>
          <p className="cadastro-subtitulo">Comece sua jornada emocional</p>
        </div>

        {/* Sucesso */}
        {sucesso ? (
          <div className="cadastro-sucesso">
            Conta criada com sucesso! Redirecionando...
          </div>
        ) : (
          <form className="cadastro-form" onSubmit={handleCadastro}>
            {erros.geral && <div className="cadastro-erro-geral">{erros.geral}</div>}

            {/* Username */}
            <div className="cadastro-campo">
              <label className="cadastro-label">Nome de usuário</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="seunome"
                className={`cadastro-input ${erros.username ? 'cadastro-input--erro' : ''}`}
                required
              />
              {erros.username && <span className="cadastro-erro-campo">{erros.username}</span>}
            </div>

            {/* Senha */}
            <div className="cadastro-campo">
              <label className="cadastro-label">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="mínimo 8 caracteres com letras"
                className={`cadastro-input ${erros.senha ? 'cadastro-input--erro' : ''}`}
                required
              />
              {erros.senha && <span className="cadastro-erro-campo">{erros.senha}</span>}
            </div>

            {/* Confirmação */}
            <div className="cadastro-campo">
              <label className="cadastro-label">Confirmar senha</label>
              <input
                type="password"
                value={confirmacao}
                onChange={(e) => setConfirmacao(e.target.value)}
                placeholder="••••••••"
                className={`cadastro-input ${erros.confirmacao ? 'cadastro-input--erro' : ''}`}
                required
              />
              {erros.confirmacao && <span className="cadastro-erro-campo">{erros.confirmacao}</span>}
            </div>

            <button type="submit" className="cadastro-btn" disabled={carregando}>
              {carregando ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>
        )}

        <button className="cadastro-login-link" onClick={() => navigate('/login')}>
          já possuo conta
        </button>
      </div>
    </div>
  );
}
