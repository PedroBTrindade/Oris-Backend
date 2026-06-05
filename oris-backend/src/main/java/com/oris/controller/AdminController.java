package com.oris.controller;

import com.oris.entity.ConfiguracaoSistema;
import com.oris.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * AdminController: endpoints exclusivos do painel administrativo do ORIS.
 *
 * Base URL: /api/admin
 *
 * IMPORTANTE: sem Spring Security neste protótipo, a proteção das rotas
 * é feita pelo frontend (verifica isAdmin no localStorage) e pelo
 * envio obrigatório da senha admin nas ações sensíveis.
 *
 * Rotas:
 *  GET  /api/admin/dashboard         — estatísticas gerais
 *  GET  /api/admin/usuarios          — lista de usuários
 *  POST /api/admin/usuarios/{id}/banir      — bane usuário
 *  POST /api/admin/usuarios/{id}/readmitir  — readmite usuário
 *  GET  /api/admin/tendencia-semanal        — dados da semana para gráfico
 *  GET  /api/admin/configuracoes            — configurações atuais
 *  PUT  /api/admin/configuracoes            — salva configurações
 *  POST /api/admin/validar-senha            — valida senha do admin
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/usuarios")
    public ResponseEntity<List<Map<String, Object>>> listarUsuarios() {
        return ResponseEntity.ok(adminService.listarUsuarios());
    }

    @PostMapping("/usuarios/{id}/banir")
    public ResponseEntity<?> banirUsuario(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        try {
            // Valida senha do admin antes de executar ação sensível
            String senha = body.getOrDefault("senhaAdmin", "");
            if (!adminService.validarSenhaAdmin(senha)) {
                return ResponseEntity.status(401).body(Map.of("erro", "Senha administrativa incorreta"));
            }

            String motivo = body.getOrDefault("motivo", "");
            adminService.banirUsuario(id, motivo);
            return ResponseEntity.ok(Map.of("mensagem", "Usuário desativado com sucesso"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("erro", e.getMessage()));
        }
    }

    @PostMapping("/usuarios/{id}/readmitir")
    public ResponseEntity<?> readmitirUsuario(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        try {
            String senha = body.getOrDefault("senhaAdmin", "");
            if (!adminService.validarSenhaAdmin(senha)) {
                return ResponseEntity.status(401).body(Map.of("erro", "Senha administrativa incorreta"));
            }

            adminService.readmitirUsuario(id);
            return ResponseEntity.ok(Map.of("mensagem", "Usuário reativado com sucesso"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("erro", e.getMessage()));
        }
    }

    @GetMapping("/tendencia-semanal")
    public ResponseEntity<List<Object[]>> getTendenciaSemanal() {
        return ResponseEntity.ok(adminService.getTendenciaSemanal());
    }

    @GetMapping("/configuracoes")
    public ResponseEntity<ConfiguracaoSistema> getConfiguracoes() {
        return ResponseEntity.ok(adminService.getConfiguracoes());
    }

    @PutMapping("/configuracoes")
    public ResponseEntity<?> salvarConfiguracoes(@RequestBody Map<String, Object> body) {
        try {
            String senha = body.getOrDefault("senhaAdmin", "").toString();
            if (!adminService.validarSenhaAdmin(senha)) {
                return ResponseEntity.status(401).body(Map.of("erro", "Senha administrativa incorreta"));
            }

            boolean registros = Boolean.parseBoolean(body.getOrDefault("registrosHabilitados", true).toString());
            boolean manutencao = Boolean.parseBoolean(body.getOrDefault("modoManutencao", false).toString());

            ConfiguracaoSistema config = adminService.salvarConfiguracoes(registros, manutencao);
            return ResponseEntity.ok(config);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("erro", e.getMessage()));
        }
    }

    @PostMapping("/validar-senha")
    public ResponseEntity<?> validarSenhaAdmin(@RequestBody Map<String, String> body) {
        String senha = body.getOrDefault("senha", "");
        boolean valida = adminService.validarSenhaAdmin(senha);
        return ResponseEntity.ok(Map.of("valida", valida));
    }
}
