package com.oris.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * DTOs (Data Transfer Objects) para autenticação no ORIS.
 *
 * Separa os dados de entrada/saída da entidade interna,
 * evitando exposição direta do modelo de banco de dados.
 */
public class AuthDTOs {

    // DTO de entrada para login
    @Data
    public static class LoginRequest {
        @NotBlank(message = "Username é obrigatório")
        private String username;

        @NotBlank(message = "Senha é obrigatória")
        private String senha;
    }

    // DTO de entrada para cadastro
    @Data
    public static class CadastroRequest {

        @NotBlank(message = "Username é obrigatório")
        @Size(min = 3, max = 50, message = "Username deve ter entre 3 e 50 caracteres")
        private String username;

        // Validação: mínimo 8 chars com ao menos uma letra
        @NotBlank(message = "Senha é obrigatória")
        @Pattern(
            regexp = "^(?=.*[a-zA-Z]).{8,}$",
            message = "a senha deve possuir no mínimo 8 caracteres com a presença de ao menos uma letra"
        )
        private String senha;

        @NotBlank(message = "Confirmação de senha é obrigatória")
        private String confirmacaoSenha;
    }

    // DTO de saída após login bem-sucedido
    @Data
    public static class LoginResponse {
        private Long id;
        private String username;
        private boolean admin;
        private boolean contaPublica;
        private boolean ativo;

        public LoginResponse(Long id, String username, boolean admin, boolean contaPublica, boolean ativo) {
            this.id = id;
            this.username = username;
            this.admin = admin;
            this.contaPublica = contaPublica;
            this.ativo = ativo;
        }
    }
}
