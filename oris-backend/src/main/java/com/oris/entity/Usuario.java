package com.oris.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Entidade Usuario: representa um usuário cadastrado no sistema ORIS.
 *
 * Campos principais:
 *  - username: identificador único do usuário (sem @)
 *  - senha: senha em texto simples (escopo acadêmico)
 *  - admin: diferencia usuário comum de administrador
 *  - ativo: controla banimento (false = banido)
 *  - contaPublica: define se os registros aparecem no feed público
 *  - ultimoAcesso: registrado a cada login para cálculo de atividade
 */
@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Nome de usuário único — não pode se repetir nem ser "admin" via cadastro
    @Column(unique = true, nullable = false, length = 50)
    private String username;

    // Senha com mínimo 8 caracteres e ao menos uma letra (validado no DTO)
    @Column(nullable = false)
    private String senha;

    // true = administrador, false = usuário comum
    @Column(nullable = false)
    private boolean admin = false;

    // false = conta banida, impede login
    @Column(nullable = false)
    private boolean ativo = true;

    // true = registros aparecem no feed público
    @Column(nullable = false)
    private boolean contaPublica = false;

    // Registrado a cada login para calcular atividade e status ativo/inativo
    private LocalDateTime ultimoAcesso;

    // Data de criação da conta
    @Column(nullable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();

    // Motivo de banimento (apenas administrativo, não exibido ao usuário)
    private String motivoBanimento;

    // Relacionamento: um usuário possui muitos registros emocionais
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RegistroEmocional> registros;
}
