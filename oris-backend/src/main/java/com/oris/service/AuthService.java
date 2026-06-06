package com.oris.service;

import com.oris.dto.AuthDTOs.*;
import com.oris.entity.Usuario;
import com.oris.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * AuthService: contém toda a lógica de negócio de autenticação do ORIS.
 *
 * Responsabilidades:
 *  - Validar credenciais de login
 *  - Cadastrar novos usuários com validações
 *  - Impedir criação/acesso do admin via fluxo normal
 *  - Registrar último acesso do usuário
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;

    /**
     * Realiza o login do usuário.
     *
     * Fluxo:
     *  1. Busca usuário pelo username
     *  2. Verifica se existe
     *  3. Verifica se está ativo (não banido)
     *  4. Valida a senha
     *  5. Registra o último acesso
     *  6. Retorna dados do usuário
     *
     * @throws RuntimeException com mensagem específica para cada falha
     */
    public LoginResponse login(LoginRequest request) {
        // Busca usuário — username sem @ no banco
        String usernameClean = request.getUsername().replace("@", "");

        Optional<Usuario> optUsuario = usuarioRepository.findByUsername(usernameClean);

        // Usuário não encontrado — mensagem genérica para evitar enumeração
        if (optUsuario.isEmpty()) {
            throw new RuntimeException("senha ou nome de usuário são incompatíveis");
        }

        Usuario usuario = optUsuario.get();

        // Conta banida — mensagem específica conforme especificação
        if (!usuario.isAtivo()) {
            throw new RuntimeException("Esta conta foi desativada");
        }

        // Senha incorreta
        if (!usuario.getSenha().equals(request.getSenha())) {
            throw new RuntimeException("senha ou nome de usuário são incompatíveis");
        }

        // Registra o momento do login para calcular atividade
        usuario.setUltimoAcesso(LocalDateTime.now());
        usuarioRepository.save(usuario);

        return new LoginResponse(
            usuario.getId(),
            usuario.getUsername(),
            usuario.isAdmin(),
            usuario.isContaPublica(),
            usuario.isAtivo()
        );
    }

    /**
     * Cadastra um novo usuário.
     *
     * Validações:
     *  - Username não pode ser "admin"
     *  - Username não pode já existir
     *  - Senha e confirmação devem ser iguais
     *  - Senha validada pelo @Pattern no DTO
     */
    public LoginResponse cadastrar(CadastroRequest request) {
        String username = request.getUsername().trim();

        // Impede criação do admin via cadastro
        if (username.equals("admin")) {
            throw new RuntimeException("Nome de usuário já foi registrado");
        }

        // Verifica duplicidade de username
        if (usuarioRepository.existsByUsername(username)) {
            throw new RuntimeException("Nome de usuário já foi registrado");
        }

        // Valida se senha e confirmação coincidem
        if (!request.getSenha().equals(request.getConfirmacaoSenha())) {
            throw new RuntimeException("A senha e a confirmação de senha devem ser iguais");
        }

        // Cria novo usuário
        Usuario usuario = new Usuario();
        usuario.setUsername(username);
        usuario.setSenha(request.getSenha());
        usuario.setAdmin(false);
        usuario.setAtivo(true);
        usuario.setContaPublica(false); // padrão: privado
        usuario.setCriadoEm(LocalDateTime.now());

        usuarioRepository.save(usuario);

        return new LoginResponse(
            usuario.getId(),
            usuario.getUsername(),
            false,
            false,
            true
        );
    }

    /**
     * Valida a senha de um usuário — usado no logout com confirmação
     * e em ações administrativas sensíveis.
     */
    public boolean validarSenha(Long usuarioId, String senha) {
        return usuarioRepository.findById(usuarioId)
            .map(u -> u.getSenha().equals(senha))
            .orElse(false);
    }
}
