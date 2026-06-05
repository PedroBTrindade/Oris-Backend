package com.oris.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entidade ConfiguracaoSistema: armazena configurações globais do ORIS.
 *
 * Padrão: somente um registro (id=1) — tabela de configuração única.
 * Gerenciada exclusivamente pelo administrador.
 */
@Entity
@Table(name = "configuracao_sistema")
@Data
@NoArgsConstructor
public class ConfiguracaoSistema {

    @Id
    private Long id = 1L;

    // Quando false, usuários comuns não podem registrar novas emoções
    @Column(nullable = false)
    private boolean registrosHabilitados = true;

    // Quando true, exibe mensagem de manutenção para usuários comuns
    @Column(nullable = false)
    private boolean modoManutencao = false;
}
