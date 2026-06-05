/**
 * api.js — Serviço central de comunicação com o backend ORIS.
 *
 * Centraliza todas as chamadas HTTP para o Spring Boot (localhost:8080).
 * Usa fetch nativo para manter o projeto sem dependências extras.
 *
 * Organização:
 *  - authAPI:    login, cadastro, validação de senha
 *  - registroAPI: CRUD de registros, feed, reações, tendências
 *  - usuarioAPI: configurações do perfil
 *  - adminAPI:   painel administrativo
 */

const BASE_URL = 'http://localhost:8080/api';

// Helper: faz a requisição e trata erros padronizados
async function request(url, options = {}) {
  const response = await fetch(`${BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();

  // Se o backend retornou erro, lança com a mensagem específica
  if (!response.ok) {
    throw new Error(data.erro || 'Erro desconhecido');
  }

  return data;
}

// ================================================
// AUTH API
// ================================================
export const authAPI = {
  /**
   * Realiza login. Retorna { id, username, admin, contaPublica, ativo }
   * ou lança Error com mensagem do backend.
   */
  login: (username, senha) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, senha }),
    }),

  /**
   * Cadastra novo usuário.
   */
  cadastrar: (username, senha, confirmacaoSenha) =>
    request('/auth/cadastro', {
      method: 'POST',
      body: JSON.stringify({ username, senha, confirmacaoSenha }),
    }),

  /**
   * Valida a senha do usuário para ações sensíveis (logout, etc.).
   * Retorna { valida: true/false }
   */
  validarSenha: (usuarioId, senha) =>
    request('/auth/validar-senha', {
      method: 'POST',
      body: JSON.stringify({ usuarioId, senha }),
    }),
};

// ================================================
// REGISTRO API
// ================================================
export const registroAPI = {
  /**
   * Cria um novo registro emocional.
   */
  criar: (emocao, descricao, tags, usuarioId) =>
    request('/registros', {
      method: 'POST',
      body: JSON.stringify({ emocao, descricao, tags, usuarioId }),
    }),

  /**
   * Busca a jornada pessoal do usuário (seus próprios registros).
   */
  getJornada: (usuarioId) =>
    request(`/registros/jornada/${usuarioId}`),

  /**
   * Busca o feed público (registros de outros usuários).
   */
  getFeed: (usuarioId) =>
    request(`/registros/feed/${usuarioId}`),

  /**
   * Adiciona uma reação a um registro público.
   * tipoReacao: "APOIAR" | "EMOCIONAR" | "CELEBRAR"
   */
  reagir: (registroId, tipoReacao) =>
    request(`/registros/${registroId}/reagir`, {
      method: 'POST',
      body: JSON.stringify({ tipoReacao }),
    }),

  /**
   * Remove um registro da jornada do usuário.
   */
  deletar: (registroId, usuarioId) =>
    request(`/registros/${registroId}/${usuarioId}`, {
      method: 'DELETE',
    }),

  /**
   * Retorna contagem de emoções por tipo para gráfico de tendências.
   */
  getTendencias: (usuarioId) =>
    request(`/registros/tendencias/${usuarioId}`),

  /**
   * Retorna dados de atividade do usuário para a aba Atividade.
   */
  getAtividade: (usuarioId) =>
    request(`/registros/atividade/${usuarioId}`),
};

// ================================================
// USUARIO API
// ================================================
export const usuarioAPI = {
  /**
   * Altera a privacidade da conta do usuário.
   */
  alterarPrivacidade: (usuarioId, contaPublica) =>
    request(`/usuarios/${usuarioId}/privacidade`, {
      method: 'PUT',
      body: JSON.stringify({ contaPublica }),
    }),
};

// ================================================
// ADMIN API
// ================================================
export const adminAPI = {
  getDashboard: () =>
    request('/admin/dashboard'),

  getUsuarios: () =>
    request('/admin/usuarios'),

  banirUsuario: (usuarioId, senhaAdmin, motivo = '') =>
    request(`/admin/usuarios/${usuarioId}/banir`, {
      method: 'POST',
      body: JSON.stringify({ senhaAdmin, motivo }),
    }),

  readmitirUsuario: (usuarioId, senhaAdmin) =>
    request(`/admin/usuarios/${usuarioId}/readmitir`, {
      method: 'POST',
      body: JSON.stringify({ senhaAdmin }),
    }),

  getTendenciaSemanal: () =>
    request('/admin/tendencia-semanal'),

  getConfiguracoes: () =>
    request('/admin/configuracoes'),

  salvarConfiguracoes: (registrosHabilitados, modoManutencao, senhaAdmin) =>
    request('/admin/configuracoes', {
      method: 'PUT',
      body: JSON.stringify({ registrosHabilitados, modoManutencao, senhaAdmin }),
    }),

  validarSenhaAdmin: (senha) =>
    request('/admin/validar-senha', {
      method: 'POST',
      body: JSON.stringify({ senha }),
    }),
};
