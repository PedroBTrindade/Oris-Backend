/**
 * constantes.js — Dados fixos do sistema ORIS.
 *
 * Centraliza emoções, tags, emojis e mensagens de tendência
 * para evitar repetição em múltiplos componentes.
 */

// ================================================
// EMOÇÕES COM EMOJIS E CORES
// ================================================
export const EMOCOES = [
  {
    valor: 'HORRIVEL',
    label: 'Horrível',
    emoji: '😭',
    cor: '#EF4444',
    corFundo: '#FEF2F2',
    corBorda: '#FCA5A5',
  },
  {
    valor: 'RUIM',
    label: 'Ruim',
    emoji: '😞',
    cor: '#F97316',
    corFundo: '#FFF7ED',
    corBorda: '#FDBA74',
  },
  {
    valor: 'NEUTRO',
    label: 'Neutro',
    emoji: '😐',
    cor: '#94A3B8',
    corFundo: '#F8FAFC',
    corBorda: '#CBD5E1',
  },
  {
    valor: 'BOM',
    label: 'Bom',
    emoji: '😊',
    cor: '#22C55E',
    corFundo: '#F0FDF4',
    corBorda: '#86EFAC',
  },
  {
    valor: 'OTIMO',
    label: 'Ótimo',
    emoji: '😄',
    cor: '#EAB308',
    corFundo: '#FEFCE8',
    corBorda: '#FDE047',
  },
];

// Mapa para acesso rápido por valor
export const EMOCAO_MAP = EMOCOES.reduce((acc, e) => {
  acc[e.valor] = e;
  return acc;
}, {});

// ================================================
// TAGS POR EMOÇÃO
// ================================================
export const TAGS_POR_EMOCAO = {
  HORRIVEL: ['triste', 'sobrecarregado', 'rejeitado', 'impotente', 'envergonhado'],
  RUIM:     ['cansado', 'desanimado', 'irritado', 'preocupado', 'frustrado', 'ansioso', 'inseguro'],
  NEUTRO:   ['indiferente', 'pensativo', 'calmo', 'reflexivo', 'entediado', 'ocupado'],
  BOM:      ['motivado', 'tranquilo', 'esperançoso', 'satisfeito', 'confiante', 'produtivo'],
  OTIMO:    ['feliz', 'animado', 'orgulhoso', 'energético', 'realizado', 'grato', 'empolgado'],
};

// ================================================
// REAÇÕES DOS POSTS
// ================================================
export const REACOES = [
  { tipo: 'APOIAR',    emoji: '💛', label: 'Apoiar' },
  { tipo: 'EMOCIONAR', emoji: '🥹', label: 'Emocionar-se' },
  { tipo: 'CELEBRAR',  emoji: '🎉', label: 'Celebrar' },
];

// ================================================
// MENSAGENS DE TENDÊNCIA (selecionadas aleatoriamente)
// ================================================
export const MENSAGENS_TENDENCIA = {
  positiva: [
    'Seu histórico recente demonstra uma tendência emocional positiva.',
    'Você apresentou registros mais otimistas nos últimos dias.',
    'Seu padrão emocional recente mostra momentos mais leves.',
    'Seus registros indicam uma fase emocional mais equilibrada.',
  ],
  neutra: [
    'Seu histórico emocional está relativamente equilibrado.',
    'Seus registros apresentam emoções variadas recentemente.',
    'Seu padrão emocional recente demonstra estabilidade.',
  ],
  alerta: [
    'Seus registros recentes demonstram momentos emocionalmente difíceis.',
    'Seu histórico indica um período de maior desgaste emocional.',
    'Talvez este seja um bom momento para descansar e procurar apoio.',
    'Você registrou emoções mais pesadas com frequência recente.',
  ],
};

/**
 * Retorna uma mensagem aleatória de acordo com o tipo de tendência.
 * @param {'positiva'|'neutra'|'alerta'} tipo
 */
export function getMensagemAleatoria(tipo) {
  const lista = MENSAGENS_TENDENCIA[tipo] || MENSAGENS_TENDENCIA.neutra;
  return lista[Math.floor(Math.random() * lista.length)];
}

/**
 * Calcula o tipo de tendência com base nas contagens de emoções.
 * @param {Object} contagens — ex: { HORRIVEL: 2, RUIM: 3, NEUTRO: 1, BOM: 4, OTIMO: 5 }
 * @returns {'positiva'|'neutra'|'alerta'}
 */
export function calcularTipoTendencia(contagens) {
  const positivas = (contagens.BOM || 0) + (contagens.OTIMO || 0);
  const negativas = (contagens.HORRIVEL || 0) + (contagens.RUIM || 0);
  const total = positivas + negativas + (contagens.NEUTRO || 0);

  if (total === 0) return 'neutra';

  const pctPositivas = positivas / total;
  const pctNegativas = negativas / total;

  if (pctPositivas >= 0.5) return 'positiva';
  if (pctNegativas >= 0.5) return 'alerta';
  return 'neutra';
}

// ================================================
// DIAS DA SEMANA (para o dashboard admin)
// ================================================
export const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
