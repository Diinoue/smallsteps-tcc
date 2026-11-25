package com.smallsteps.smallsteps.service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.smallsteps.smallsteps.dto.MembroComunidadeDTO;
import com.smallsteps.smallsteps.dto.ParticipamDTO;
import com.smallsteps.smallsteps.entity.Comunidade;
import com.smallsteps.smallsteps.entity.Participam;
import com.smallsteps.smallsteps.entity.ParticipamId;
import com.smallsteps.smallsteps.entity.Usuario;
import com.smallsteps.smallsteps.enums.Cargo;
import com.smallsteps.smallsteps.repository.CommunityRepository;
import com.smallsteps.smallsteps.repository.ParticipamRepository;
import com.smallsteps.smallsteps.repository.UserRepository;

@Service
public class ParticipamService {

    public static final int MAX_MEMBERS_PER_COMMUNITY = 50;

    private final ParticipamRepository participamRepository;
    private final UserRepository userRepository;
    private final CommunityRepository communityRepository;

    public ParticipamService(
            ParticipamRepository participamRepository,
            UserRepository userRepository,
            CommunityRepository communityRepository) {
        this.participamRepository = participamRepository;
        this.userRepository = userRepository;
        this.communityRepository = communityRepository;
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
    public List<MembroComunidadeDTO> findMembersByComunidade(int idComunidade) {
        return participamRepository.findByIdComunidade(idComunidade)
                .stream()
                .map(p -> {
                    Usuario usuario = userRepository.findById(p.getIdUsuario()).orElse(null);
                    String nome = usuario != null ? usuario.getNome() : "Membro #" + p.getIdUsuario();
                    String foto = usuario != null ? usuario.getFoto() : null;
                    return new MembroComunidadeDTO(
                            p.getIdUsuario(),
                            p.getIdComunidade(),
                            nome,
                            foto,
                            p.getPontos(),
                            p.getCargo(),
                            p.getDtInicio());
                })
                .sorted(Comparator
                        .comparingInt((MembroComunidadeDTO m) -> roleOrder(m.getCargo()))
                        .thenComparing(Comparator.comparingInt(MembroComunidadeDTO::getPontos).reversed()))
                .collect(Collectors.toList());
    }

    private int roleOrder(Cargo cargo) {
        if (cargo == Cargo.DONO) return 0;
        if (cargo == Cargo.ADMINISTRADOR) return 1;
        return 2;
    }

    @Transactional
    public Participam updateCargo(int idUsuario, int idComunidade, Cargo novoCargo) {
        if (novoCargo == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cargo inválido");
        }
        Participam participam = findById(idUsuario, idComunidade);
        participam.setCargo(novoCargo);
        return participamRepository.save(participam);
    }

    @Transactional(readOnly = true)
    public List<Participam> findByUsuario(int idUsuario) {
        return participamRepository.findByIdUsuario(idUsuario);
    }

    @Transactional
    public Participam create(ParticipamDTO dto) {
        Comunidade comunidade = communityRepository.findById(dto.getIdComunidade())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comunidade não encontrada"));
        if (comunidade.isPrivado()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Comunidades privadas exigem aprovação por solicitação");
        }

        ParticipamId id = new ParticipamId(dto.getIdUsuario(), dto.getIdComunidade());
        if (participamRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Usuário já participa desta comunidade");
        }

        long totalMembros = participamRepository.countByIdComunidade(dto.getIdComunidade());
        if (totalMembros >= MAX_MEMBERS_PER_COMMUNITY) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A comunidade atingiu o limite máximo de " + MAX_MEMBERS_PER_COMMUNITY + " membros");
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
