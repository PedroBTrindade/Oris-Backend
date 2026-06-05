package com.oris.service;

import com.oris.dto.RegistroDTOs.*;
import com.oris.entity.RegistroEmocional;
import com.oris.entity.RegistroEmocional.Emocao;
import com.oris.entity.Usuario;
import com.oris.repository.ConfiguracaoSistemaRepository;
import com.oris.repository.RegistroEmocionalRepository;
import com.oris.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * RegistroService: lógica de negócio para registros emocionais.
 *
 * Responsabilidades:
 *  - Criar novos registros com validação de modo manutenção
 *  - Decidir se o registro é público (baseado na conta do usuário)
 *  - Buscar feed público e jornada pessoal
 *  - Processar reações
 *  - Gerar dados para tendências e atividade
 */
@Service
@RequiredArgsConstructor
public class RegistroService {

    private final RegistroEmocionalRepository registroRepository;
    private final UsuarioRepository usuarioRepository;
    private final ConfiguracaoSistemaRepository configRepository;

    /**
     * Cria um novo registro emocional.
     * O registro é marcado como público apenas se a conta do usuário for pública.
     */
    public RegistroResponse criarRegistro(RegistroRequest request) {
        // Verifica modo manutenção
        configRepository.findById(1L).ifPresent(config -> {
            if (config.isModoManutencao()) {
                throw new RuntimeException("O sistema está temporariamente em manutenção.");
            }
            if (!config.isRegistrosHabilitados()) {
                throw new RuntimeException("O registro de emoções está temporariamente desabilitado.");
            }
        });

        Usuario usuario = usuarioRepository.findById(request.getUsuarioId())
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        RegistroEmocional registro = new RegistroEmocional();
        registro.setEmocao(request.getEmocao());
        registro.setDescricao(request.getDescricao());
        registro.setTags(request.getTags());
        registro.setUsuario(usuario);
        registro.setRegistradoEm(LocalDateTime.now());

        // Apenas aparece no feed público se a conta do usuário for pública
        registro.setPublico(usuario.isContaPublica());

        registroRepository.save(registro);
        return toResponse(registro);
    }

    /**
     * Retorna a jornada pessoal do usuário (todos os seus registros, mais recente primeiro).
     */
    public List<RegistroResponse> buscarJornadaUsuario(Long usuarioId) {
        return registroRepository
            .findByUsuarioIdOrderByRegistradoEmDesc(usuarioId)
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    /**
     * Retorna o feed público: registros públicos de outros usuários.
     */
    public List<RegistroResponse> buscarFeedPublico(Long usuarioAtualId) {
        return registroRepository
            .findByPublicoTrueAndUsuarioIdNotOrderByRegistradoEmDesc(usuarioAtualId)
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    /**
     * Adiciona uma reação a um registro público.
     * Tipos aceitos: APOIAR, EMOCIONAR, CELEBRAR
     */
    public RegistroResponse reagir(Long registroId, ReacaoRequest request) {
        RegistroEmocional registro = registroRepository.findById(registroId)
            .orElseThrow(() -> new RuntimeException("Registro não encontrado"));

        switch (request.getTipoReacao().toUpperCase()) {
            case "APOIAR"    -> registro.setReacaoApoiar(registro.getReacaoApoiar() + 1);
            case "EMOCIONAR" -> registro.setReacaoEmocionar(registro.getReacaoEmocionar() + 1);
            case "CELEBRAR"  -> registro.setReacaoCelebrar(registro.getReacaoCelebrar() + 1);
            default -> throw new RuntimeException("Tipo de reação inválido");
        }

        registroRepository.save(registro);
        return toResponse(registro);
    }

    /**
     * Remove um registro do usuário (apenas o dono pode deletar).
     */
    public void deletarRegistro(Long registroId, Long usuarioId) {
        RegistroEmocional registro = registroRepository.findById(registroId)
            .orElseThrow(() -> new RuntimeException("Registro não encontrado"));

        if (!registro.getUsuario().getId().equals(usuarioId)) {
            throw new RuntimeException("Sem permissão para deletar este registro");
        }

        registroRepository.delete(registro);
    }

    /**
     * Gera mapa de contagem de emoções do usuário para o gráfico de tendências.
     * Ex: { OTIMO: 5, BOM: 3, NEUTRO: 1, RUIM: 2, HORRIVEL: 0 }
     */
    public Map<String, Long> tendenciasUsuario(Long usuarioId) {
        return Map.of(
            "HORRIVEL", registroRepository.countByUsuarioIdAndEmocao(usuarioId, Emocao.HORRIVEL),
            "RUIM",     registroRepository.countByUsuarioIdAndEmocao(usuarioId, Emocao.RUIM),
            "NEUTRO",   registroRepository.countByUsuarioIdAndEmocao(usuarioId, Emocao.NEUTRO),
            "BOM",      registroRepository.countByUsuarioIdAndEmocao(usuarioId, Emocao.BOM),
            "OTIMO",    registroRepository.countByUsuarioIdAndEmocao(usuarioId, Emocao.OTIMO)
        );
    }

    /**
     * Gera dados de atividade do usuário para a aba Jornada > Atividade.
     */
    public Map<String, Object> atividadeUsuario(Long usuarioId) {
        LocalDateTime seteDiasAtras = LocalDateTime.now().minusDays(7);
        LocalDateTime trintaDiasAtras = LocalDateTime.now().minusDays(30);

        long totalRegistros  = registroRepository.countByUsuarioId(usuarioId);
        long registrosSemana = registroRepository.countByUsuarioIdAndRegistradoEmAfter(usuarioId, seteDiasAtras);
        long registrosMes    = registroRepository.countByUsuarioIdAndRegistradoEmAfter(usuarioId, trintaDiasAtras);

        return Map.of(
            "totalRegistros",   totalRegistros,
            "registrosSemana",  registrosSemana,
            "registrosMes",     registrosMes,
            "diasAtivos",       Math.min(registrosSemana, 7) // estimativa de dias com ao menos 1 registro
        );
    }

    // -------------------------------------------------------
    // Método auxiliar: converte entidade → DTO de resposta
    // -------------------------------------------------------
    private RegistroResponse toResponse(RegistroEmocional r) {
        RegistroResponse dto = new RegistroResponse();
        dto.setId(r.getId());
        dto.setEmocao(r.getEmocao());
        dto.setDescricao(r.getDescricao());
        dto.setTags(r.getTags());
        dto.setPublico(r.isPublico());
        dto.setRegistradoEm(r.getRegistradoEm());
        dto.setReacaoApoiar(r.getReacaoApoiar());
        dto.setReacaoEmocionar(r.getReacaoEmocionar());
        dto.setReacaoCelebrar(r.getReacaoCelebrar());
        dto.setUsername(r.getUsuario().getUsername());
        dto.setUsuarioId(r.getUsuario().getId());
        return dto;
    }
}
