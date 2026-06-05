import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { registroAPI } from '../../services/api';
import Layout from '../../components/Layout/Layout';
import JornadaRegistros from './JornadaRegistros';
import JornadaAtividade from './JornadaAtividade';
import JornadaTendencias from './JornadaTendencias';
import './Jornada.css';

/**
 * Jornada: página de histórico emocional do usuário.
 *
 * Dividida em 3 abas:
 *  1. Registros   — lista de emoções salvas, com opção de excluir
 *  2. Atividade   — resumo de uso (acessos, registros, frequência)
 *  3. Tendências  — gráfico emocional e mensagens acolhedoras
 */
export default function Jornada() {
  const { usuario } = useAuth();
  const [abaAtiva, setAbaAtiva] = useState('registros');
  const [registros, setRegistros] = useState([]);
  const [tendencias, setTendencias] = useState({});
  const [atividade, setAtividade] = useState({});
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const [regs, tends, atv] = await Promise.all([
        registroAPI.getJornada(usuario.id),
        registroAPI.getTendencias(usuario.id),
        registroAPI.getAtividade(usuario.id),
      ]);
      setRegistros(regs);
      setTendencias(tends);
      setAtividade(atv);
    } catch {
      // Erros individuais tratados em cada sub-componente
    } finally {
      setCarregando(false);
    }
  };

  const handleDeletar = async (registroId) => {
    try {
      await registroAPI.deletar(registroId, usuario.id);
      setRegistros(prev => prev.filter(r => r.id !== registroId));
    } catch (err) {
      alert(err.message || 'Erro ao excluir registro');
    }
  };

  const abas = [
    { id: 'registros',  label: 'Registros' },
    { id: 'atividade',  label: 'Atividade' },
    { id: 'tendencias', label: 'Tendências' },
  ];

  return (
    <Layout>
      <div className="jornada">
        {/* Header */}
        <div className="jornada-header">
          <h1 className="jornada-titulo">Minha Jornada</h1>
          <p className="jornada-subtitulo">{registros.length} registros</p>
        </div>

        {/* Abas de navegação */}
        <div className="jornada-abas">
          {abas.map(aba => (
            <button
              key={aba.id}
              className={`jornada-aba ${abaAtiva === aba.id ? 'jornada-aba--ativa' : ''}`}
              onClick={() => setAbaAtiva(aba.id)}
            >
              {aba.label}
            </button>
          ))}
        </div>

        {/* Conteúdo da aba ativa */}
        <div className="jornada-conteudo">
          {carregando ? (
            <div className="jornada-loading">Carregando sua jornada...</div>
          ) : (
            <>
              {abaAtiva === 'registros' && (
                <JornadaRegistros
                  registros={registros}
                  onDeletar={handleDeletar}
                />
              )}
              {abaAtiva === 'atividade' && (
                <JornadaAtividade atividade={atividade} />
              )}
              {abaAtiva === 'tendencias' && (
                <JornadaTendencias
                  tendencias={tendencias}
                  registros={registros}
                  usuarioId={usuario.id}
                />
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
