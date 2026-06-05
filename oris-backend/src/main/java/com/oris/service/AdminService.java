package com.oris.service;

import com.oris.entity.ConfiguracaoSistema;
import com.oris.entity.Usuario;
import com.oris.repository.ConfiguracaoSistemaRepository;
import com.oris.repository.RegistroEmocionalRepository;
import com.oris.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * AdminService: lógica exclusiva do painel administrativo do ORIS.
 *
 * Responsabilidades:
 *  - Gerar dados do dashboard (stats gerais)
 *  - Gerenciar usuários (banir, readmitir)
 *  - Controlar configurações do sistema (manutenção, registros)
 *  - Gerar relatórios e tendências semanais
 */
@Service
@RequiredArgsConstructor
public class AdminService {

    private final UsuarioRepository usuarioRepository;
    private final RegistroEmocionalRepository registroRepository;
    private final ConfiguracaoSistemaRepository configRepository;

    /**
     * Retorna dados do dashboard administrativo.
     * Taxa de atividade: usuários que acessaram nos últimos 7 dias.
     */
    public Map<String, Object> getDashboardStats() {
        LocalDateTime seteDiasAtras = LocalDateTime.now().minusDays(7);
        LocalDateTime hoje = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);

        List<Usuario> todosUsuarios = usuarioRepository.findAll();

        long total = todosUsuarios.stream().filter(u -> !u.isAdmin()).count();
        long ativos = todosUsuarios.stream()
            .filter(u -> !u.isAdmin() && u.getUltimoAcesso() != null && u.getUltimoAcesso().isAfter(seteDiasAtras))
            .count();
        long inativos = total - ativos;
        long emoceoesHoje = registroRepository.countRegistrosDesde(hoje);

        double taxaAtividade = total > 0 ? (ativos * 100.0 / total) : 0;

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsuarios", total);
        stats.put("usuariosAtivos", ativos);
        stats.put("usuariosInativos", inativos);
        stats.put("emocoesHoje", emoceoesHoje);
        stats.put("taxaAtividade", Math.round(taxaAtividade));

        return stats;
    }

    /**
     * Retorna lista de todos os usuários (exceto admin) com dados para exibição.
     */
    public List<Map<String, Object>> listarUsuarios() {
        LocalDateTime seteDiasAtras = LocalDateTime.now().minusDays(7);

        return usuarioRepository.findAll().stream()
            .filter(u -> !u.isAdmin())
            .map(u -> {
                Map<String, Object> dados = new HashMap<>();
                dados.put("id", u.getId());
                dados.put("username", u.getUsername());
                dados.put("ativo", u.isAtivo());
                dados.put("contaPublica", u.isContaPublica());
                dados.put("ultimoAcesso", u.getUltimoAcesso());
                dados.put("criadoEm", u.getCriadoEm());
                dados.put("totalEmocoes", registroRepository.countByUsuarioId(u.getId()));
                // Ativo = acessou nos últimos 7 dias
                boolean estaAtivo = u.getUltimoAcesso() != null && u.getUltimoAcesso().isAfter(seteDiasAtras);
                dados.put("statusAtividade", estaAtivo ? "Ativo" : "Inativo");
                return dados;
            })
            .toList();
    }

    /**
     * Bane um usuário (ativo = false).
     * Mantém todos os registros no sistema.
     * Exige senha do admin (validada no controller).
     */
    public void banirUsuario(Long usuarioId, String motivo) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (usuario.isAdmin()) {
            throw new RuntimeException("Não é possível banir o administrador");
        }

        usuario.setAtivo(false);
        usuario.setMotivoBanimento(motivo);
        usuarioRepository.save(usuario);
    }

    /**
     * Readmite um usuário banido (ativo = true).
     */
    public void readmitirUsuario(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        usuario.setAtivo(true);
        usuario.setMotivoBanimento(null);
        usuarioRepository.save(usuario);
    }

    /**
     * Retorna tendência emocional da última semana para o dashboard.
     * Formato: lista com totais por dia da semana e emoção.
     */
    public List<Object[]> getTendenciaSemanal() {
        LocalDateTime seteDiasAtras = LocalDateTime.now().minusDays(7);
        return registroRepository.tendenciaSemanal(seteDiasAtras);
    }

    /**
     * Retorna configurações atuais do sistema.
     */
    public ConfiguracaoSistema getConfiguracoes() {
        return configRepository.findById(1L).orElseGet(() -> {
            ConfiguracaoSistema config = new ConfiguracaoSistema();
            return configRepository.save(config);
        });
    }

    /**
     * Altera configurações do sistema (manutenção, registros habilitados).
     */
    public ConfiguracaoSistema salvarConfiguracoes(boolean registrosHabilitados, boolean modoManutencao) {
        ConfiguracaoSistema config = getConfiguracoes();
        config.setRegistrosHabilitados(registrosHabilitados);
        config.setModoManutencao(modoManutencao);
        return configRepository.save(config);
    }

    /**
     * Verifica se a senha fornecida é do administrador.
     * Usado nas confirmações de ações administrativas sensíveis.
     */
    public boolean validarSenhaAdmin(String senha) {
        return usuarioRepository.findByUsername("admin")
            .map(u -> u.getSenha().equals(senha))
            .orElse(false);
    }
}
