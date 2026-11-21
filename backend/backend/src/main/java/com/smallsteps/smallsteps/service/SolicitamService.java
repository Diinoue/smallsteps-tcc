package com.smallsteps.smallsteps.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.smallsteps.smallsteps.dto.SolicitacaoResponseDTO;
import com.smallsteps.smallsteps.dto.SolicitamDTO;
import com.smallsteps.smallsteps.entity.Comunidade;
import com.smallsteps.smallsteps.entity.Participam;
import com.smallsteps.smallsteps.entity.ParticipamId;
import com.smallsteps.smallsteps.entity.Solicitam;
import com.smallsteps.smallsteps.entity.SolicitamId;
import com.smallsteps.smallsteps.entity.Usuario;
import com.smallsteps.smallsteps.enums.Cargo;
import com.smallsteps.smallsteps.repository.CommunityRepository;
import com.smallsteps.smallsteps.repository.ParticipamRepository;
import com.smallsteps.smallsteps.repository.SolicitamRepository;
import com.smallsteps.smallsteps.repository.UserRepository;

@Service
public class SolicitamService {

    private final SolicitamRepository solicitamRepository;
    private final CommunityRepository communityRepository;
    private final ParticipamRepository participamRepository;
    private final UserRepository userRepository;

    public SolicitamService(
            SolicitamRepository solicitamRepository,
            CommunityRepository communityRepository,
            ParticipamRepository participamRepository,
            UserRepository userRepository) {
        this.solicitamRepository = solicitamRepository;
        this.communityRepository = communityRepository;
        this.participamRepository = participamRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<SolicitacaoResponseDTO> findByComunidade(int idComunidade) {
        Comunidade comunidade = communityRepository.findById(idComunidade)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comunidade não encontrada"));

        if (!comunidade.isPrivado()) {
            return List.of();
        }

        return solicitamRepository.findByIdComunidadeOrderByDtInicioDesc(idComunidade)
                .stream()
                .map(s -> {
                    Usuario usuario = userRepository.findById(s.getIdUsuario()).orElse(null);
                    String nome = usuario != null ? usuario.getNome() : "Usuário #" + s.getIdUsuario();
                    String foto = usuario != null ? usuario.getFoto() : null;
                    return new SolicitacaoResponseDTO(
                            s.getIdUsuario(),
                            s.getIdComunidade(),
                            nome,
                            foto,
                            s.getDtInicio());
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public Solicitam create(SolicitamDTO dto) {
        Comunidade comunidade = communityRepository.findById(dto.idComunidade)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comunidade não encontrada"));

        if (!comunidade.isPrivado()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comunidades públicas não requerem solicitação");
        }

        ParticipamId participamId = new ParticipamId(dto.idUsuario, dto.idComunidade);
        if (participamRepository.existsById(participamId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Usuário já participa desta comunidade");
        }

        SolicitamId solicitamId = new SolicitamId(dto.idUsuario, dto.idComunidade);
        if (solicitamRepository.existsById(solicitamId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Solicitação já enviada");
        }

        Solicitam solicitam = new Solicitam();
        solicitam.setIdUsuario(dto.idUsuario);
        solicitam.setIdComunidade(dto.idComunidade);
        solicitam.setDtInicio(dto.dtInicio != null ? dto.dtInicio : LocalDateTime.now());

        return solicitamRepository.save(solicitam);
    }

    @Transactional
    public Participam accept(int idComunidade, int idUsuario) {
        SolicitamId solicitamId = new SolicitamId(idUsuario, idComunidade);
        if (!solicitamRepository.existsById(solicitamId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Solicitação não encontrada");
        }

        solicitamRepository.deleteById(solicitamId);

        ParticipamId participamId = new ParticipamId(idUsuario, idComunidade);
        if (participamRepository.existsById(participamId)) {
            return participamRepository.findById(participamId).orElseThrow();
        }

        Participam participam = new Participam();
        participam.setIdUsuario(idUsuario);
        participam.setIdComunidade(idComunidade);
        participam.setPontos(0);
        participam.setCargo(Cargo.MEMBRO);
        participam.setDtInicio(LocalDateTime.now());

        return participamRepository.save(participam);
    }

    @Transactional
    public void reject(int idComunidade, int idUsuario) {
        SolicitamId solicitamId = new SolicitamId(idUsuario, idComunidade);
        if (!solicitamRepository.existsById(solicitamId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Solicitação não encontrada");
        }
        solicitamRepository.deleteById(solicitamId);
    }
}
