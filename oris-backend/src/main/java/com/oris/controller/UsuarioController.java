package com.oris.controller;

import com.oris.entity.Usuario;
import com.oris.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * UsuarioController: endpoints REST para operações do próprio usuário.
 *
 * Base URL: /api/usuarios
 *
 * Rotas:
 *  PUT /api/usuarios/{id}/privacidade — altera visibilidade da conta
 */
@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;

    /**
     * PUT /api/usuarios/{id}/privacidade
     * Altera se a conta do usuário é pública ou privada.
     * Body: { "contaPublica": true/false }
     */
    @PutMapping("/{id}/privacidade")
    public ResponseEntity<?> alterarPrivacidade(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        try {
            Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

            boolean contaPublica = body.getOrDefault("contaPublica", false);
            usuario.setContaPublica(contaPublica);
            usuarioRepository.save(usuario);

            return ResponseEntity.ok(Map.of(
                "mensagem", "Privacidade atualizada com sucesso",
                "contaPublica", contaPublica
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("erro", e.getMessage()));
        }
    }
}
