import React, { useMemo } from 'react';
import { EMOCOES, calcularTipoTendencia, getMensagemAleatoria } from '../../services/constantes';
import './Jornada.css';

/**
 * JornadaTendencias: visualização emocional do usuário.
 *
 * Exibe:
 *  - Gráfico de barras com frequência de cada emoção
 *  - Emoções mais frequentes
 *  - Mensagem acolhedora baseada na tendência (positiva/neutra/alerta)
 *
 * Não realiza diagnósticos — apenas apresenta padrões de forma acolhedora.
 */
export default function JornadaTendencias({ tendencias, registros }) {
  // Calcula o tipo de tendência e escolhe mensagem aleatória
  const tipoTendencia = useMemo(() => calcularTipoTendencia(tendencias), [tendencias]);
  const mensagem = useMemo(() => getMensagemAleatoria(tipoTendencia), [tipoTendencia]);

  // Valor máximo para escalar as barras
  const maxValor = Math.max(1, ...Object.values(tendencias));

  // Emoção mais frequente
  const emocaoMaisFrequente = EMOCOES.reduce((max, e) =>
    (tendencias[e.valor] || 0) > (tendencias[max.valor] || 0) ? e : max
  , EMOCOES[0]);

  const totalRegistros = Object.values(tendencias).reduce((s, v) => s + v, 0);

  const corMensagem = {
    positiva: 'var(--cor-bom)',
    neutra:   'var(--cor-neutro)',
    alerta:   'var(--cor-ruim)',
  }[tipoTendencia];

  if (totalRegistros === 0) {
    return (
      <div className="jornada-vazio">
        <p>Sem dados suficientes ainda.</p>
        <p>Continue registrando suas emoções para ver tendências.</p>
      </div>
    );
  }

  return (
    <div className="tendencias">
      {/* Mensagem acolhedora */}
      <div className="tendencias-mensagem" style={{ '--cor-tendencia': corMensagem }}>
        <p>{mensagem}</p>
      </div>

      {/* Gráfico de barras */}
      <div className="tendencias-grafico">
        <p className="tendencias-secao-label">Distribuição emocional</p>
        <div className="tendencias-barras">
          {EMOCOES.map(emocao => {
            const contagem = tendencias[emocao.valor] || 0;
            const pct = totalRegistros > 0 ? Math.round((contagem / totalRegistros) * 100) : 0;
            const larguraBarra = maxValor > 0 ? (contagem / maxValor) * 100 : 0;

            return (
              <div key={emocao.valor} className="tendencias-barra-linha">
                <span className="tendencias-barra-emoji">{emocao.emoji}</span>
                <span className="tendencias-barra-label">{emocao.label}</span>
                <div className="tendencias-barra-track">
                  <div
                    className="tendencias-barra-fill"
                    style={{
                      width: `${larguraBarra}%`,
                      background: emocao.cor,
                    }}
                  />
                </div>
                <span className="tendencias-barra-valor">{contagem}</span>
                <span className="tendencias-barra-pct">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Emoção mais frequente */}
      {totalRegistros > 0 && (
        <div className="tendencias-destaque"
          style={{ '--cor-emocao': emocaoMaisFrequente.cor, '--cor-fundo': emocaoMaisFrequente.corFundo }}
        >
          <span className="tendencias-destaque-emoji">{emocaoMaisFrequente.emoji}</span>
          <div>
            <p className="tendencias-destaque-titulo">Emoção mais registrada</p>
            <p className="tendencias-destaque-valor">{emocaoMaisFrequente.label}</p>
          </div>
          <span className="tendencias-destaque-contagem">
            {tendencias[emocaoMaisFrequente.valor] || 0}x
          </span>
        </div>
      )}

      {/* Aviso: sistema não realiza diagnósticos */}
      <p className="tendencias-aviso">
        Estas informações são apenas um reflexo dos seus registros e não representam diagnóstico de qualquer natureza.
      </p>
    </div>
  );
}
