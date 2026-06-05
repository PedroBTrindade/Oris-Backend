package com.oris.config;

import com.oris.entity.Usuario;
import com.oris.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * DataInitializer: executado automaticamente na inicialização do Spring Boot.
 * Responsabilidade: garantir que o administrador fixo (@admin) exista no banco.
 *
 * O admin não pode ser criado via cadastro nem removido.
 * Credenciais fixas conforme especificação:
 *   - Usuário: @admin
 *   - Senha: Oris2026
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;

    @Override
    public void run(String... args) {
        // Verifica se o admin já existe para evitar duplicação
        if (!usuarioRepository.existsByUsername("admin")) {
            Usuario admin = new Usuario();
            admin.setUsername("admin");
            // Senha armazenada em texto simples conforme escopo acadêmico sem Spring Security
            admin.setSenha("Oris2026");
            admin.setAdmin(true);
            admin.setAtivo(true);
            admin.setContaPublica(false);
            usuarioRepository.save(admin);

            System.out.println(">>> Admin criado com sucesso: @admin / Oris2026");
        } else {
            System.out.println(">>> Admin já existe no banco de dados.");
        }
    }
}
