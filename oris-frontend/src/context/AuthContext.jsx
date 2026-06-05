import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * AuthContext: contexto global de autenticação do ORIS.
 *
 * Armazena os dados do usuário logado no localStorage e disponibiliza
 * para todos os componentes via hook useAuth().
 *
 * Dados armazenados no localStorage:
 *  - oris_usuario: objeto JSON com id, username, admin, contaPublica, ativo
 *  - oris_tema: "claro" ou "escuro"
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Inicializa o estado a partir do localStorage (mantém sessão após reload)
  const [usuario, setUsuario] = useState(() => {
    try {
      const salvo = localStorage.getItem('oris_usuario');
      return salvo ? JSON.parse(salvo) : null;
    } catch {
      return null;
    }
  });

  // Inicializa o tema salvo
  const [tema, setTema] = useState(() => {
    return localStorage.getItem('oris_tema') || 'claro';
  });

  // Aplica o tema no elemento raiz sempre que mudar
  useEffect(() => {
    document.documentElement.setAttribute('data-tema', tema);
    localStorage.setItem('oris_tema', tema);
  }, [tema]);

  /**
   * Salva o usuário no estado e no localStorage após login/cadastro.
   */
  const login = (dadosUsuario) => {
    setUsuario(dadosUsuario);
    localStorage.setItem('oris_usuario', JSON.stringify(dadosUsuario));
  };

  /**
   * Remove o usuário do estado e do localStorage no logout.
   */
  const logout = () => {
    setUsuario(null);
    localStorage.removeItem('oris_usuario');
  };

  /**
   * Atualiza apenas um campo do usuário salvo (ex: contaPublica após mudança).
   */
  const atualizarUsuario = (campo, valor) => {
    setUsuario(prev => {
      const atualizado = { ...prev, [campo]: valor };
      localStorage.setItem('oris_usuario', JSON.stringify(atualizado));
      return atualizado;
    });
  };

  /**
   * Alterna entre tema claro e escuro.
   */
  const alternarTema = () => {
    setTema(prev => prev === 'claro' ? 'escuro' : 'claro');
  };

  const valor = {
    usuario,
    tema,
    login,
    logout,
    atualizarUsuario,
    alternarTema,
    estaLogado: !!usuario,
    eAdmin: usuario?.admin === true,
  };

  return (
    <AuthContext.Provider value={valor}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook customizado para acessar o contexto de autenticação.
 * Uso: const { usuario, login, logout } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
