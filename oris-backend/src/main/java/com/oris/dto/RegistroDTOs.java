package com.oris.dto;

import com.oris.entity.RegistroEmocional.Emocao;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * DTOs para operações de registro emocional.
 */
public class RegistroDTOs {

    // DTO de entrada para criar um novo registro
    @Data
    public static class RegistroRequest {

        @NotNull(message = "Emoção é obrigatória")
        private Emocao emocao;

        // Descrição opcional — máximo 500 caracteres
        private String descricao;

        // Tags separadas por vírgula: "triste,sobrecarregado"
        private String tags;

        // ID do usuário que está registrando (vem do localStorage no frontend)
        @NotNull(message = "ID do usuário é obrigatório")
        private Long usuarioId;
    }

    // DTO de saída com dados completos do registro
    @Data
    public static class RegistroResponse {
        private Long id;
        private Emocao emocao;
        private String descricao;
        private String tags;
        private boolean publico;
        private LocalDateTime registradoEm;
        private int reacaoApoiar;
        private int reacaoEmocionar;
        private int reacaoCelebrar;

        // Dados básicos do usuário dono do registro
        private String username;
        private Long usuarioId;
    }

    // DTO para adicionar uma reação a um registro público
    @Data
    public static class ReacaoRequest {
        // Tipos: APOIAR, EMOCIONAR, CELEBRAR
        @NotNull(message = "Tipo de reação é obrigatório")
        private String tipoReacao;
    }
}
