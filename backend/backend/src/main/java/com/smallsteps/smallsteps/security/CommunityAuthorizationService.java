package com.smallsteps.smallsteps.security;

import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.smallsteps.smallsteps.entity.Participam;
import com.smallsteps.smallsteps.entity.ParticipamId;
import com.smallsteps.smallsteps.enums.Cargo;
import com.smallsteps.smallsteps.repository.ParticipamRepository;

@Service
public class CommunityAuthorizationService {

    private final ParticipamRepository participamRepository;

    public CommunityAuthorizationService(ParticipamRepository participamRepository) {
        this.participamRepository = participamRepository;
    }

    public Optional<Participam> findParticipation(int userId, int communityId) {
        return participamRepository.findById(new ParticipamId(userId, communityId));
    }

    public Cargo getCargoOrNull(int userId, int communityId) {
        return findParticipation(userId, communityId)
                .map(Participam::getCargo)
                .orElse(null);
    }

    public boolean isOwner(int userId, int communityId) {
        return getCargoOrNull(userId, communityId) == Cargo.DONO;
    }

    public boolean isAdminOrOwner(int userId, int communityId) {
        Cargo cargo = getCargoOrNull(userId, communityId);
        return cargo == Cargo.DONO || cargo == Cargo.ADMINISTRADOR;
    }

    public Participam requireMember(int userId, int communityId) {
        return findParticipation(userId, communityId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN, "Você precisa ser membro desta comunidade para realizar esta ação"));
    }

    public Participam requireAdminOrOwner(int userId, int communityId) {
        Participam participam = requireMember(userId, communityId);
        if (participam.getCargo() != Cargo.DONO && participam.getCargo() != Cargo.ADMINISTRADOR) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Apenas administradores ou o dono da comunidade têm permissão para esta ação");
        }
        return participam;
    }

    public Participam requireOwner(int userId, int communityId) {
        Participam participam = requireMember(userId, communityId);
        if (participam.getCargo() != Cargo.DONO) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Apenas o dono da comunidade tem permissão para esta ação");
        }
        return participam;
    }
}
