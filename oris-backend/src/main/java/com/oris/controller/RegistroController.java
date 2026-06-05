package com.oris.controller;

import com.oris.dto.RegistroDTOs.*;
import com.oris.service.RegistroService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * RegistroController: endpoints REST para registros emocionais do ORIS.
 *
 * Base URL: /api/registros
 *
 * Rotas:
 *  POST   /api/registros                    — cria novo registro
 *  GET    /api/registros/jornada/{userId}   — retorna jornada pessoal
 *  GET    /api/registros/feed/{userId}      — retorna feed público (de outros)
 *  POST   /api/registros/{id}/reagir        — adiciona reação
 *  DELETE /api/registros/{id}/{userId}      — remove registro próprio
 *  GET    /api/registros/tendencias/{userId}— dados de tendência para gráfico
 *  GET    /api/registros/atividade/{userId} — dados de atividade pessoal
 */
@RestController
@RequestMapping("/api/registros")
@RequiredArgsConstructor
public class RegistroController {

    private final RegistroService registroService;

    @PostMapping
    public ResponseEntity<?> criarRegistro(@Valid @RequestBody RegistroRequest request) {
        try {
            RegistroResponse response = registroService.criarRegistro(request);
            return ResponseEntity.status(201).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("erro", e.getMessage()));
        }
    }

    @GetMapping("/jornada/{usuarioId}")
    public ResponseEntity<List<RegistroResponse>> getJornada(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(registroService.buscarJornadaUsuario(usuarioId));
    }

    @GetMapping("/feed/{usuarioId}")
    public ResponseEntity<List<RegistroResponse>> getFeedPublico(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(registroService.buscarFeedPublico(usuarioId));
    }

    @PostMapping("/{id}/reagir")
    public ResponseEntity<?> reagir(@PathVariable Long id, @RequestBody ReacaoRequest request) {
        try {
            RegistroResponse response = registroService.reagir(id, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("erro", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}/{usuarioId}")
    public ResponseEntity<?> deletar(@PathVariable Long id, @PathVariable Long usuarioId) {
        try {
            registroService.deletarRegistro(id, usuarioId);
            return ResponseEntity.ok(Map.of("mensagem", "Registro removido com sucesso"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("erro", e.getMessage()));
        }
    }

    @GetMapping("/tendencias/{usuarioId}")
    public ResponseEntity<Map<String, Long>> getTendencias(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(registroService.tendenciasUsuario(usuarioId));
    }

    @GetMapping("/atividade/{usuarioId}")
    public ResponseEntity<Map<String, Object>> getAtividade(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(registroService.atividadeUsuario(usuarioId));
    }
}
