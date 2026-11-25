package com.smallsteps.smallsteps.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.smallsteps.smallsteps.dto.CriarEventoDTO;
import com.smallsteps.smallsteps.dto.EventoResponseDTO;
import com.smallsteps.smallsteps.entity.Comunidade;
import com.smallsteps.smallsteps.entity.Evento;
import com.smallsteps.smallsteps.entity.Usuario;
import com.smallsteps.smallsteps.repository.ComentarioRepository;
import com.smallsteps.smallsteps.repository.CommunityRepository;
import com.smallsteps.smallsteps.repository.EventoRepository;
import com.smallsteps.smallsteps.repository.UserRepository;

@Service
public class EventoService {

    private final EventoRepository eventoRepository;
    private final CommunityRepository communityRepository;
    private final UserRepository userRepository;
    private final ComentarioRepository comentarioRepository;

    public EventoService(
            EventoRepository eventoRepository,
            CommunityRepository communityRepository,
            UserRepository userRepository,
            ComentarioRepository comentarioRepository) {
        this.eventoRepository = eventoRepository;
        this.communityRepository = communityRepository;
        this.userRepository = userRepository;
        this.comentarioRepository = comentarioRepository;
    }

    private EventoResponseDTO toDTO(Evento e) {
        EventoResponseDTO dto = new EventoResponseDTO(e);
        dto.setCommentsCount(comentarioRepository.countByEventoId(e.getId()));
        return dto;
    }

    @Transactional(readOnly = true)
    public List<EventoResponseDTO> findAll() {
        return eventoRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EventoResponseDTO> findByComunidade(int comunidadeId) {
        return eventoRepository.findByComunidadeIdOrderByDiaInicioAsc(comunidadeId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public int getCommunityIdByEventId(int id) {
        Evento evento = eventoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento não encontrado com id: " + id));
        return evento.getComunidade().getId();
    }

    @Transactional(readOnly = true)
    public EventoResponseDTO findById(int id) {
        Evento evento = eventoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento não encontrado com id: " + id));
        return toDTO(evento);
    }

    @Transactional
    public EventoResponseDTO create(int comunidadeId, CriarEventoDTO dto) {
        Comunidade comunidade = communityRepository.findById(comunidadeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comunidade não encontrada com id: " + comunidadeId));

        if (dto.getIdUsuario() == null || dto.getIdUsuario() <= 0) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário autenticado obrigatório para criar o evento");
        }

        Usuario usuario = userRepository.findById(dto.getIdUsuario())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado para criar o evento"));

        Evento evento = new Evento();
        evento.setComunidade(comunidade);
        evento.setUsuario(usuario);
        evento.setTitulo(dto.getTitulo());
        evento.setDescricao(dto.getDescricao());
        evento.setLocal(dto.getLocal());
        evento.setFoto(dto.getFoto());

        evento.setDiaInicio(dto.getDiaInicio() != null ? dto.getDiaInicio() : LocalDate.now());
        evento.setDiaFim(dto.getDiaFim() != null ? dto.getDiaFim() : evento.getDiaInicio());
        evento.setHorarioInicio(dto.getHorarioInicio() != null ? dto.getHorarioInicio() : LocalTime.of(12, 0));
        evento.setHorarioFim(dto.getHorarioFim() != null ? dto.getHorarioFim() : LocalTime.of(18, 0));

        Evento salvo = eventoRepository.save(evento);
        return new EventoResponseDTO(salvo);
    }

    @Transactional
    public EventoResponseDTO update(int id, CriarEventoDTO dto) {
        Evento evento = eventoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento não encontrado com id: " + id));

        if (dto.getTitulo() != null) evento.setTitulo(dto.getTitulo());
        if (dto.getDescricao() != null) evento.setDescricao(dto.getDescricao());
        if (dto.getLocal() != null) evento.setLocal(dto.getLocal());
        if (dto.getFoto() != null) evento.setFoto(dto.getFoto());
        if (dto.getDiaInicio() != null) evento.setDiaInicio(dto.getDiaInicio());
        if (dto.getDiaFim() != null) evento.setDiaFim(dto.getDiaFim());
        if (dto.getHorarioInicio() != null) evento.setHorarioInicio(dto.getHorarioInicio());
        if (dto.getHorarioFim() != null) evento.setHorarioFim(dto.getHorarioFim());

        if (dto.getIdComunidade() != null && dto.getIdComunidade() > 0) {
            Comunidade com = communityRepository.findById(dto.getIdComunidade()).orElse(null);
            if (com != null) evento.setComunidade(com);
        }

        Evento atualizado = eventoRepository.save(evento);
        return toDTO(atualizado);
    }

    @Transactional
    public void delete(int id) {
        if (!eventoRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento não encontrado com id: " + id);
        }
        comentarioRepository.deleteByEventoId(id);
        eventoRepository.deleteById(id);
    }
}
