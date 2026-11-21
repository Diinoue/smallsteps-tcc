package com.smallsteps.smallsteps.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.smallsteps.smallsteps.dto.CriarMetaDTO;
import com.smallsteps.smallsteps.dto.GoalDTOResponse;
import com.smallsteps.smallsteps.dto.SubGoalDTOResponse;
import com.smallsteps.smallsteps.dto.SubMetaDTO;
import com.smallsteps.smallsteps.entity.Meta;
import com.smallsteps.smallsteps.entity.SubMeta;
import com.smallsteps.smallsteps.entity.Usuario;
import com.smallsteps.smallsteps.repository.GoalRepository;
import com.smallsteps.smallsteps.repository.SubMetaRepository;
import com.smallsteps.smallsteps.repository.UserRepository;

@Service
public class GoalService {

    private final GoalRepository goalRepository;
    private final SubMetaRepository subMetaRepository;
    private final UserRepository userRepository;

    public GoalService(GoalRepository goalRepository,
                       SubMetaRepository subMetaRepository,
                       UserRepository userRepository) {
        this.goalRepository = goalRepository;
        this.subMetaRepository = subMetaRepository;
        this.userRepository = userRepository;
    }

    // ── Buscar todas as metas de um usuário (não concluídas primeiro, concluídas depois) ──
    @Transactional(readOnly = true)
    public List<GoalDTOResponse> findAllByUsuario(int idUsuario) {
        List<Meta> metas = goalRepository.findByUsuarioId(idUsuario);
        return metas.stream()
                .sorted(Comparator
                        .comparing(Meta::isConcluido)
                        .thenComparing(Comparator.comparingInt(Meta::getId).reversed()))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // ── Buscar uma meta pelo ID ───────────────────────────────────────────────
    @Transactional(readOnly = true)
    public GoalDTOResponse findById(int id) {
        Meta meta = goalRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Meta não encontrada com id: " + id));

        return toDto(meta);
    }

    // ── Criar nova meta ───────────────────────────────────────────────────────
    @Transactional
    public GoalDTOResponse create(CriarMetaDTO dto) {
        if (dto.titulo == null || dto.titulo.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O título da meta é obrigatório");
        }
        if (dto.milestone == null || dto.milestone.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O milestone é obrigatório");
        }

        Usuario usuario = userRepository.findById(dto.idUsuario)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Usuário não encontrado com id: " + dto.idUsuario));

        Meta meta = new Meta();
        meta.setTitulo(dto.titulo.trim());
        meta.setUsuario(usuario);
        meta.setVisivel(dto.visivel != null ? dto.visivel : true);
        meta.setConcluido(false);
        meta.setMilestone(dto.milestone.trim());
        meta.setDtInicio(dto.dtInicio != null ? dto.dtInicio : LocalDateTime.now());
        meta.setDtFim(dto.dtFim);

        Meta salva = goalRepository.save(meta);

        // Salva submetas
        if (dto.subMetas != null) {
            List<SubMeta> subs = new ArrayList<>();
            for (int i = 0; i < dto.subMetas.size(); i++) {
                SubMetaDTO s = dto.subMetas.get(i);
                SubMeta sub = new SubMeta();
                sub.setMeta(salva);
                sub.setTitulo(s.titulo != null && !s.titulo.isBlank() ? s.titulo : "Nova submeta");
                sub.setConcluido(false);
                sub.setPos(i + 1);
                sub.setDtInicio(s.dtInicio != null ? s.dtInicio : LocalDateTime.now());
                sub.setDtFim(s.dtFim);
                subs.add(sub);
            }
            subMetaRepository.saveAll(subs);
            salva.setSubMetas(subs);
        }

        return toDto(salva);
    }

    // ── Atualizar meta existente ──────────────────────────────────────────────
    @Transactional
    public GoalDTOResponse update(int id, CriarMetaDTO dto) {
        Meta meta = goalRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Meta não encontrada com id: " + id));

        if (dto.titulo != null) {
            if (dto.titulo.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O título da meta não pode estar em branco");
            }
            meta.setTitulo(dto.titulo.trim());
        }
        if (dto.milestone != null) {
            if (dto.milestone.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O milestone não pode estar em branco");
            }
            meta.setMilestone(dto.milestone.trim());
        }
        if (dto.dtFim != null) meta.setDtFim(dto.dtFim);
        if (dto.concluido != null) {
            meta.setConcluido(dto.concluido);
            if (dto.concluido && meta.getDtFim() == null) {
                meta.setDtFim(LocalDateTime.now());
            }
        }

        // Atualiza submetas: remove as antigas e reinsere
        if (dto.subMetas != null) {
            subMetaRepository.deleteByMetaId(id);

            List<SubMeta> subs = new ArrayList<>();
            for (int i = 0; i < dto.subMetas.size(); i++) {
                SubMetaDTO s = dto.subMetas.get(i);
                SubMeta sub = new SubMeta();
                sub.setMeta(meta);
                sub.setTitulo(s.titulo != null && !s.titulo.isBlank() ? s.titulo : "Nova submeta");
                sub.setConcluido(s.concluido);
                sub.setPos(i + 1);
                sub.setDtInicio(s.dtInicio != null ? s.dtInicio : LocalDateTime.now());
                sub.setDtFim(s.dtFim);
                subs.add(sub);
            }
            List<SubMeta> savedSubs = subMetaRepository.saveAll(subs);
            meta.setSubMetas(savedSubs);
        }

        Meta atualizada = goalRepository.save(meta);
        return toDto(atualizada);
    }

    // ── Deletar meta ──────────────────────────────────────────────────────────
    @Transactional
    public void delete(int id) {
        if (!goalRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Meta não encontrada com id: " + id);
        }
        subMetaRepository.deleteByMetaId(id);
        goalRepository.deleteById(id);
    }

    // ── Marcar meta como concluída ────────────────────────────────────────────
    @Transactional
    public GoalDTOResponse concluir(int id) {
        Meta meta = goalRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Meta não encontrada com id: " + id));
        meta.setConcluido(true);
        meta.setDtFim(LocalDateTime.now());
        return toDto(goalRepository.save(meta));
    }

    // ── Helper: entidade → DTO ─────────────────────────────────────────────────
    private GoalDTOResponse toDto(Meta meta) {
        GoalDTOResponse dto = new GoalDTOResponse();
        dto.id = meta.getId();
        dto.idUsuario = meta.getUsuario() != null ? meta.getUsuario().getId() : null;
        dto.title = meta.getTitulo();
        dto.milestone = meta.getMilestone();
        dto.concluido = meta.isConcluido();
        dto.dtInicio = meta.getDtInicio();
        dto.dtFim = meta.getDtFim();

        List<SubMeta> subs = subMetaRepository.findByMetaIdOrderByPos(meta.getId());
        dto.subMetas = subs.stream().map(s -> {
            SubGoalDTOResponse sd = new SubGoalDTOResponse();
            sd.id = s.getId();
            sd.concluido = s.isConcluido();
            sd.titulo = s.getTitulo();
            sd.dtInicio = s.getDtInicio();
            sd.dtFim = s.getDtFim();
            sd.pos = s.getPos();
            return sd;
        }).collect(Collectors.toList());

        return dto;
    }
}
