package com.oris.repository;

import com.oris.entity.RegistroEmocional;
import com.oris.entity.RegistroEmocional.Emocao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * RegistroEmocionalRepository: acesso ao banco para registros de emoção.
 */
@Repository
public interface RegistroEmocionalRepository extends JpaRepository<RegistroEmocional, Long> {

    // Busca todos os registros de um usuário, do mais recente ao mais antigo
    List<RegistroEmocional> findByUsuarioIdOrderByRegistradoEmDesc(Long usuarioId);

    // Busca registros públicos de OUTROS usuários (para o feed da Home)
    List<RegistroEmocional> findByPublicoTrueAndUsuarioIdNotOrderByRegistradoEmDesc(Long usuarioId);

    // Conta registros de um usuário por emoção (para tendências)
    long countByUsuarioIdAndEmocao(Long usuarioId, Emocao emocao);

    // Conta total de registros de um usuário
    long countByUsuarioId(Long usuarioId);

    // Registros de hoje (para dashboard admin)
    @Query("SELECT COUNT(r) FROM RegistroEmocional r WHERE r.registradoEm >= :inicio")
    long countRegistrosDesde(@Param("inicio") LocalDateTime inicio);

    // Registros de um usuário em um período (para atividade)
    long countByUsuarioIdAndRegistradoEmAfter(Long usuarioId, LocalDateTime depois);

    // Registros públicos ordenados por data (feed geral)
    List<RegistroEmocional> findByPublicoTrueOrderByRegistradoEmDesc();

    // Contagem por emoção para relatório admin
    @Query("SELECT r.emocao, COUNT(r) FROM RegistroEmocional r WHERE r.registradoEm >= :inicio GROUP BY r.emocao")
    List<Object[]> contarPorEmocaoDesde(@Param("inicio") LocalDateTime inicio);

    // Registros da semana agrupados por dia e emoção (dashboard admin)
    @Query("SELECT EXTRACT(DOW FROM CAST(r.registradoEm AS date)), r.emocao, COUNT(r) FROM RegistroEmocional r WHERE r.registradoEm >= :inicio GROUP BY EXTRACT(DOW FROM CAST(r.registradoEm AS date)), r.emocao")
List<Object[]> tendenciaSemanal(@Param("inicio") LocalDateTime inicio);
}
