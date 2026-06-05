package com.oris.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Entidade RegistroEmocional: representa um registro de emoção feito por um usuário.
 *
 * Emoções válidas: HORRIVEL, RUIM, NEUTRO, BOM, OTIMO
 * Tags: lista de strings separadas por vírgula (armazenadas como texto)
 * Público: true apenas quando o usuário tem conta pública no momento do registro
 */
@Entity
@Table(name = "registros_emocionais")
@Data
@NoArgsConstructor
public class RegistroEmocional {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Emoção registrada (enum como string para legibilidade no banco)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Emocao emocao;

    // Descrição opcional escrita pelo usuário
    @Column(length = 500)
    private String descricao;

    // Tags selecionadas, armazenadas separadas por vírgula
    // Ex: "triste,sobrecarregado,impotente"
    @Column(length = 300)
    private String tags;

    // Define se aparece no feed público
    @Column(nullable = false)
    private boolean publico = false;

    // Data e hora do registro
    @Column(nullable = false)
    private LocalDateTime registradoEm = LocalDateTime.now();

    // Reações de apoio: 💛 Apoiar
    private int reacaoApoiar = 0;

    // Reações de emoção: 🥹 Emocionar-se
    private int reacaoEmocionar = 0;

    // Reações de celebração: 🎉 Celebrar
    private int reacaoCelebrar = 0;

    // Relacionamento com o usuário dono do registro
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    /**
     * Enum de emoções disponíveis no sistema ORIS.
     * Cada valor possui emoji e label definidos no frontend.
     */
    public enum Emocao {
        HORRIVEL,   // 😭
        RUIM,       // 😞
        NEUTRO,     // 😐
        BOM,        // 😊
        OTIMO       // 😄
    }
}
