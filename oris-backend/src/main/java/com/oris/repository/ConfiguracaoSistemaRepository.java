package com.oris.repository;

import com.oris.entity.ConfiguracaoSistema;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * ConfiguracaoSistemaRepository: acesso ao registro único de configuração do ORIS.
 */
@Repository
public interface ConfiguracaoSistemaRepository extends JpaRepository<ConfiguracaoSistema, Long> {
}
