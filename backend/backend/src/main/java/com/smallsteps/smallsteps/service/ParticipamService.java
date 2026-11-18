package com.smallsteps.smallsteps.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.smallsteps.smallsteps.dto.ParticipamDTO;
import com.smallsteps.smallsteps.entity.Participam;
import com.smallsteps.smallsteps.entity.ParticipamId;
import com.smallsteps.smallsteps.enums.Cargo;
import com.smallsteps.smallsteps.repository.ParticipamRepository;

@Service
public class ParticipamService {

    private final ParticipamRepository participamRepository;

    public ParticipamService(ParticipamRepository participamRepository) {
        this.participamRepository = participamRepository;
    }

    @Transactional(readOnly = true)
    public List<Participam> findAll() {
        return participamRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Participam findById(int idUsuario, int idComunidade) {
        ParticipamId id = new ParticipamId(idUsuario, idComunidade);
        return participamRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Participação não encontrada"));
    }

    @Transactional(readOnly = true)
    public List<Participam> findByComunidade(int idComunidade) {
        return participamRepository.findByIdComunidade(idComunidade);
    }

    @Transactional(readOnly = true)
    public List<Participam> findByUsuario(int idUsuario) {
        return participamRepository.findByIdUsuario(idUsuario);
    }

    @Transactional
    public Participam create(ParticipamDTO dto) {
        ParticipamId id = new ParticipamId(dto.getIdUsuario(), dto.getIdComunidade());
        if (participamRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Usuário já participa desta comunidade");
        }

        Participam participam = new Participam();
        participam.setIdUsuario(dto.getIdUsuario());
        participam.setIdComunidade(dto.getIdComunidade());
        participam.setPontos(dto.getPontos());
        participam.setCargo(dto.getCargo() != null ? dto.getCargo() : Cargo.MEMBRO);
        participam.setDtInicio(dto.getDtInicio() != null ? dto.getDtInicio() : LocalDateTime.now());

        return participamRepository.save(participam);
    }

    @Transactional
    public Participam update(int idUsuario, int idComunidade, ParticipamDTO dto) {
        Participam participam = findById(idUsuario, idComunidade);

        participam.setPontos(dto.getPontos());
        if (dto.getCargo() != null) {
            participam.setCargo(dto.getCargo());
        }

        return participamRepository.save(participam);
    }

    @Transactional
    public void delete(int idUsuario, int idComunidade) {
        ParticipamId id = new ParticipamId(idUsuario, idComunidade);
        if (!participamRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Participação não encontrada");
        }
        participamRepository.deleteById(id);
    }
}
