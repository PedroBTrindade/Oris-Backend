package com.oris.repository;

import com.oris.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * UsuarioRepository: interface de acesso ao banco para a entidade Usuario.
 * O Spring Data JPA implementa automaticamente os métodos baseados na nomenclatura.
 */
@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    // Busca por username — usado no login e validação de duplicatas
    Optional<Usuario> findByUsername(String username);

    // Verifica existência por username — usado no DataInitializer e cadastro
    boolean existsByUsername(String username);
}
