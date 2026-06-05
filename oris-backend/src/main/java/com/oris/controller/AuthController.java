package com.oris.controller;

import com.oris.dto.AuthDTOs.*;
import com.oris.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * AuthController: endpoints REST de autenticação do ORIS.
 *
 * Base URL: /api/auth
 *
 * Rotas:
 *  POST /api/auth/login    — realiza login
 *  POST /api/auth/cadastro — registra novo usuário
 *  POST /api/auth/validar-senha — valida senha para logout e ações sensíveis
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/auth/login
     * Autentica o usuário e retorna seus dados básicos para armazenar no localStorage.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            // Retorna 401 com a mensagem de erro específica
            return ResponseEntity.status(401).body(Map.of("erro", e.getMessage()));
        }
    }

    /**
     * POST /api/auth/cadastro
     * Cria um novo usuário e já retorna os dados para redirecionar ao login.
     */
    @PostMapping("/cadastro")
    public ResponseEntity<?> cadastrar(@Valid @RequestBody CadastroRequest request) {
        try {
            LoginResponse response = authService.cadastrar(request);
            return ResponseEntity.status(201).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("erro", e.getMessage()));
        }
    }

    /**
     * POST /api/auth/validar-senha
     * Valida a senha do usuário para confirmar ações sensíveis (logout, mudança de privacidade).
     */
    @PostMapping("/validar-senha")
    public ResponseEntity<?> validarSenha(@RequestBody Map<String, Object> body) {
        try {
            Long usuarioId = Long.parseLong(body.get("usuarioId").toString());
            String senha = body.get("senha").toString();
            boolean valida = authService.validarSenha(usuarioId, senha);
            return ResponseEntity.ok(Map.of("valida", valida));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("erro", "Dados inválidos"));
        }
    }
}
