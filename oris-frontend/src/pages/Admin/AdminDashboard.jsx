import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminAPI, authAPI } from '../../services/api';
import { EMOCOES, DIAS_SEMANA } from '../../services/constantes';
import './Admin.css';

/**
 * AdminDashboard: painel administrativo completo do ORIS.
 *
 * Abas:
 *  - Dashboard:  estatísticas gerais + tendência semanal
 *  - Usuários:   lista, busca, banir, readmitir
 *  - Relatórios: cards de relatório e exportação
 *  - Config:     modo manutenção, registros habilitados, logout
 */
export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [abaAtiva, setAbaAtiva] = useState('dashboard');

  // Dashboard
  const [stats, setStats] = useState(null);
  const [tendenciaSemanal, setTendenciaSemanal] = useState([]);

  // Usuários
  const [usuarios, setUsuarios] = useState([]);
  const [busca, setBusca] = useState('');

  // Config
  const [configSistema, setConfigSistema] = useState({ registrosHabilitados: true, modoManutencao: false });

  // Modal de confirmação administrativa
  const [modal, setModal] = useState({ aberto: false, acao: null, payload: null, erro: '' });
  const [senhaAdmin, setSenhaAdmin] = useState('');
  const [motivoBan, setMotivoBan] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => { carregarTudo(); }, []);

  const carregarTudo = async () => {
    setCarregando(true);
    try {
      const [s, u, ts, cfg] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getUsuarios(),
        adminAPI.getTendenciaSemanal(),
        adminAPI.getConfiguracoes(),
      ]);
      setStats(s);
      setUsuarios(u);
      setTendenciaSemanal(ts);
      setConfigSistema(cfg);
    } catch (e) {
      console.error('Erro ao carregar admin', e);
    } finally {
      setCarregando(false);
    }
  };

  // Abre o modal com a ação e payload definidos
  const abrirModal = (acao, payload = null) => {
    setModal({ aberto: true, acao, payload, erro: '' });
    setSenhaAdmin('');
    setMotivoBan('');
  };

  const fecharModal = () => {
    setModal({ aberto: false, acao: null, payload: null, erro: '' });
    setSenhaAdmin('');
  };

  // Executa a ação confirmada pelo admin
  const executarAcao = async () => {
    if (!senhaAdmin) {
      setModal(m => ({ ...m, erro: 'Digite a senha administrativa.' }));
      return;
    }
    try {
      const { acao, payload } = modal;

      if (acao === 'banir') {
        await adminAPI.banirUsuario(payload.id, senhaAdmin, motivoBan);
      } else if (acao === 'readmitir') {
        await adminAPI.readmitirUsuario(payload.id, senhaAdmin);
      } else if (acao === 'salvarConfig') {
        await adminAPI.salvarConfiguracoes(
          payload.registrosHabilitados,
          payload.modoManutencao,
          senhaAdmin
        );
        setConfigSistema(payload);
      } else if (acao === 'logout') {
        const res = await adminAPI.validarSenhaAdmin(senhaAdmin);
        if (!res.valida) throw new Error('Senha incorreta');
        logout();
        return;
      }

      fecharModal();
      carregarTudo();
    } catch (err) {
      setModal(m => ({ ...m, erro: err.message || 'Senha incorreta ou erro ao executar ação.' }));
    }
  };

  const usuariosFiltrados = usuarios.filter(u =>
    u.username.toLowerCase().includes(busca.toLowerCase())
  );

  // Monta dados do gráfico semanal agrupados por dia
  const dadosSemana = (() => {
    const mapa = {};
    tendenciaSemanal.forEach(([dia, emocao, qtd]) => {
      if (!mapa[dia]) mapa[dia] = {};
      mapa[dia][emocao] = Number(qtd);
    });
    return mapa;
  })();

  const abas = [
    { id: 'dashboard',  label: 'Dashboard' },
    { id: 'usuarios',   label: 'Usuários' },
    { id: 'relatorios', label: 'Relatórios' },
    { id: 'config',     label: 'Config' },
  ];

  return (
    <div className="admin">
      {/* Cabeçalho */}
      <header className="admin-header">
        <div>
          <h1 className="admin-header-titulo">Painel de Administração</h1>
          <p className="admin-header-sub">Monitoramento e Relatórios do ORIS</p>
        </div>
      </header>

      {/* Navegação */}
      <nav className="admin-nav">
        {abas.map(aba => (
          <button
            key={aba.id}
            className={`admin-nav-btn ${abaAtiva === aba.id ? 'admin-nav-btn--ativa' : ''}`}
            onClick={() => setAbaAtiva(aba.id)}
          >
            {aba.label}
          </button>
        ))}
      </nav>

      <main className="admin-conteudo">
        {carregando ? (
          <div className="admin-loading">Carregando...</div>
        ) : (
          <>
            {/* ── DASHBOARD ── */}
            {abaAtiva === 'dashboard' && stats && (
              <div className="admin-dashboard">
                <div className="admin-stats-grid">
                  <div className="admin-stat-card admin-stat-card--roxo">
                    <span className="admin-stat-valor">{stats.totalUsuarios}</span>
                    <span className="admin-stat-label">Total de Usuários</span>
                    <span className="admin-stat-desc">{stats.usuariosAtivos} ativos</span>
                  </div>
                  <div className="admin-stat-card admin-stat-card--ciano">
                    <span className="admin-stat-valor">{stats.emocoesHoje}</span>
                    <span className="admin-stat-label">Emoções Hoje</span>
                    <span className="admin-stat-desc">Média: {stats.totalUsuarios > 0 ? Math.round(stats.emocoesHoje / stats.totalUsuarios) : 0}</span>
                  </div>
                  <div className="admin-stat-card admin-stat-card--laranja">
                    <span className="admin-stat-valor">{stats.usuariosInativos}</span>
                    <span className="admin-stat-label">Inativos</span>
                    <span className="admin-stat-desc">sem acesso recente</span>
                  </div>
                  <div className="admin-stat-card admin-stat-card--azul">
                    <span className="admin-stat-valor">{stats.taxaAtividade}%</span>
                    <span className="admin-stat-label">Taxa de Atividade</span>
                    <span className="admin-stat-desc">Últimos 7 dias</span>
                  </div>
                </div>

                {/* Tendência semanal */}
                <div className="admin-tendencia">
                  <h3 className="admin-secao-titulo">Tendência de Emoções (Última Semana)</h3>
                  <div className="admin-semana">
                    {[1,2,3,4,5,6,0].map(diaNum => {
                      const dados = dadosSemana[diaNum] || {};
                      const total = EMOCOES.reduce((s, e) => s + (dados[e.valor] || 0), 0);
                      if (total === 0) return null;
                      return (
                        <div key={diaNum} className="admin-semana-linha">
                          <span className="admin-semana-dia">{DIAS_SEMANA[diaNum]}</span>
                          <div className="admin-semana-barra-wrapper">
                            {EMOCOES.map(em => {
                              const v = dados[em.valor] || 0;
                              if (v === 0) return null;
                              return (
                                <div
                                  key={em.valor}
                                  className="admin-semana-segmento"
                                  style={{ flex: v, background: em.cor }}
                                  title={`${em.label}: ${v}`}
                                />
                              );
                            })}
                          </div>
                          <span className="admin-semana-total">{total} emoções</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── USUÁRIOS ── */}
            {abaAtiva === 'usuarios' && (
              <div className="admin-usuarios">
                <div className="admin-busca-wrapper">
                  <input
                    className="admin-busca"
                    type="text"
                    placeholder="Buscar usuário..."
                    value={busca}
                    onChange={e => setBusca(e.target.value)}
                  />
                </div>
                <div className="admin-lista-usuarios">
                  {usuariosFiltrados.map(u => (
                    <div key={u.id} className={`admin-usuario-card ${!u.ativo ? 'admin-usuario-card--banido' : ''}`}>
                      <div className="avatar admin-usuario-avatar">
                        {u.username[0].toUpperCase()}
                      </div>
                      <div className="admin-usuario-info">
                        <span className="admin-usuario-nome">@{u.username}</span>
                        <span className="admin-usuario-meta">
                          Último acesso: {u.ultimoAcesso ? new Date(u.ultimoAcesso).toLocaleDateString('pt-BR') : 'Nunca'}
                        </span>
                      </div>
                      <div className="admin-usuario-stats">
                        <span className="admin-usuario-emocoes">{u.totalEmocoes}</span>
                        <span className="admin-usuario-emocoes-label">emoções</span>
                      </div>
                      <span className={`admin-usuario-status ${u.ativo ? 'admin-usuario-status--ativo' : 'admin-usuario-status--banido'}`}>
                        {u.ativo ? 'Ativo' : 'Banido'}
                      </span>
                      {u.ativo ? (
                        <button className="admin-usuario-btn admin-usuario-btn--banir" onClick={() => abrirModal('banir', u)}>
                          Banir
                        </button>
                      ) : (
                        <button className="admin-usuario-btn admin-usuario-btn--readmitir" onClick={() => abrirModal('readmitir', u)}>
                          Readmitir
                        </button>
                      )}
                    </div>
                  ))}
                  {usuariosFiltrados.length === 0 && (
                    <p className="admin-loading">Nenhum usuário encontrado.</p>
                  )}
                </div>
              </div>
            )}

            {/* ── RELATÓRIOS ── */}
            {abaAtiva === 'relatorios' && (
              <div className="admin-relatorios">
                {[
                  { titulo: 'Relatório de Emoções', desc: 'Análise detalhada de emoções por período', periodo: 'Últimas 7 dias' },
                  { titulo: 'Relatório de Usuários', desc: 'Atividade e engajamento dos usuários', periodo: 'Últimos 30 dias' },
                  { titulo: 'Tendências', desc: 'Análise de tendências emocionais', periodo: 'Últimos 90 dias' },
                  { titulo: 'Exportar Dados', desc: 'Baixe dados em formato CSV ou PDF', periodo: 'Todos os períodos' },
                ].map(rel => (
                  <div key={rel.titulo} className="admin-relatorio-card">
                    <div>
                      <h3 className="admin-relatorio-titulo">{rel.titulo}</h3>
                      <p className="admin-relatorio-desc">{rel.desc}</p>
                      <p className="admin-relatorio-periodo">{rel.periodo}</p>
                    </div>
                    <button className="admin-relatorio-btn">Ver</button>
                  </div>
                ))}
              </div>
            )}

            {/* ── CONFIG ── */}
            {abaAtiva === 'config' && (
              <div className="admin-config">
                <div className="admin-config-card">
                  <h3 className="admin-config-titulo">Configurações do Sistema</h3>

                  <label className="admin-config-item">
                    <span className="admin-config-item-label">Permitir novos registros</span>
                    <input
                      type="checkbox"
                      checked={configSistema.registrosHabilitados}
                      onChange={e => abrirModal('salvarConfig', { ...configSistema, registrosHabilitados: e.target.checked })}
                    />
                  </label>

                  <label className="admin-config-item">
                    <span className="admin-config-item-label">Modo manutenção</span>
                    <input
                      type="checkbox"
                      checked={configSistema.modoManutencao}
                      onChange={e => abrirModal('salvarConfig', { ...configSistema, modoManutencao: e.target.checked })}
                    />
                  </label>
                </div>

                <button className="admin-logout-btn" onClick={() => abrirModal('logout')}>
                  Fazer Logout
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── MODAL DE CONFIRMAÇÃO ADMIN ── */}
      {modal.aberto && (
        <div className="admin-modal-overlay" onClick={fecharModal}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3 className="admin-modal-titulo">Confirmar ação administrativa</h3>

            {modal.acao === 'banir' && (
              <>
                <p className="admin-modal-texto">Deseja realmente desativar a conta de <strong>@{modal.payload?.username}</strong>?</p>
                <input
                  className="admin-modal-input"
                  type="text"
                  placeholder="Motivo do banimento (opcional)"
                  value={motivoBan}
                  onChange={e => setMotivoBan(e.target.value)}
                />
              </>
            )}
            {modal.acao === 'readmitir' && (
              <p className="admin-modal-texto">Reativar a conta de <strong>@{modal.payload?.username}</strong>?</p>
            )}
            {(modal.acao === 'salvarConfig' || modal.acao === 'logout') && (
              <p className="admin-modal-texto">Digite sua senha para confirmar esta ação administrativa.</p>
            )}

            <input
              className="admin-modal-input"
              type="password"
              placeholder="Senha administrativa"
              value={senhaAdmin}
              onChange={e => setSenhaAdmin(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && executarAcao()}
            />

            {modal.erro && <p className="admin-modal-erro">{modal.erro}</p>}

            <div className="admin-modal-botoes">
              <button className="admin-modal-cancelar" onClick={fecharModal}>Cancelar</button>
              <button className="admin-modal-confirmar" onClick={executarAcao}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
