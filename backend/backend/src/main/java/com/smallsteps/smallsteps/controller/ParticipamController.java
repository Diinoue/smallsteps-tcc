package com.smallsteps.smallsteps.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.smallsteps.smallsteps.dto.MembroComunidadeDTO;
import com.smallsteps.smallsteps.dto.ParticipamDTO;
import com.smallsteps.smallsteps.entity.Participam;
import com.smallsteps.smallsteps.enums.Cargo;
import com.smallsteps.smallsteps.security.AuthenticatedUserService;
import com.smallsteps.smallsteps.security.CommunityAuthorizationService;
import com.smallsteps.smallsteps.service.ParticipamService;

@CrossOrigin
@RestController
@RequestMapping("/participam")
public class ParticipamController {

    private final ParticipamService participamService;
    private final AuthenticatedUserService authenticatedUserService;
    private final CommunityAuthorizationService communityAuthService;

    public ParticipamController(
            ParticipamService participamService,
            AuthenticatedUserService authenticatedUserService,
            CommunityAuthorizationService communityAuthService) {
        this.participamService = participamService;
        this.authenticatedUserService = authenticatedUserService;
        this.communityAuthService = communityAuthService;
    }

    @GetMapping("/me")
    public List<Participam> getMyCommunities(Authentication authentication) {
        int currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        return participamService.findByUsuario(currentUserId);
    }

    @GetMapping("/me/{idComunidade}")
    public Participam getMyParticipation(@PathVariable int idComunidade, Authentication authentication) {
        int currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        return participamService.findById(currentUserId, idComunidade);
    }

    @GetMapping
    public List<Participam> getAll(
            @RequestParam(required = false) Integer idComunidade,
            @RequestParam(required = false) Integer idUsuario,
            Authentication authentication) {
        if (idComunidade != null) {
            return participamService.findByComunidade(idComunidade);
        }
        int currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        return participamService.findByUsuario(currentUserId);
    }

    @GetMapping("/comunidade/{idComunidade}/membros")
    public List<MembroComunidadeDTO> getMembersByComunidade(@PathVariable int idComunidade) {
        return participamService.findMembersByComunidade(idComunidade);
    }

    @GetMapping("/{idUsuario}/{idComunidade}")
    public Participam getById(@PathVariable int idUsuario, @PathVariable int idComunidade) {
        return participamService.findById(idUsuario, idComunidade);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Participam create(@RequestBody ParticipamDTO dto, Authentication authentication) {
        dto.setIdUsuario(authenticatedUserService.getCurrentUserId(authentication));
        dto.setCargo(Cargo.MEMBRO);
        dto.setPontos(0);
        return participamService.create(dto);
    }

    @PutMapping("/{idUsuario}/{idComunidade}")
    public Participam update(
            @PathVariable int idUsuario,
            @PathVariable int idComunidade,
            @RequestBody ParticipamDTO dto) {
        return participamService.update(idUsuario, idComunidade, dto);
    }

    @PutMapping("/{idUsuario}/{idComunidade}/cargo")
    public Participam updateCargo(
            @PathVariable int idUsuario,
            @PathVariable int idComunidade,
            @RequestBody ParticipamDTO dto,
            Authentication authentication) {
        int currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        communityAuthService.requireOwner(currentUserId, idComunidade);
        if (idUsuario == currentUserId) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O dono não pode alterar o próprio cargo");
        }
        if (dto.getCargo() == Cargo.DONO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não é permitido atribuir o cargo de DONO por esta rota");
        }
        return participamService.updateCargo(idUsuario, idComunidade, dto.getCargo());
    }

    @DeleteMapping("/me/{idComunidade}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void leaveCommunity(@PathVariable int idComunidade, Authentication authentication) {
        int currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        if (communityAuthService.isOwner(currentUserId, idComunidade)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "O dono não pode sair da comunidade; exclua a comunidade se desejar");
        }
        participamService.delete(currentUserId, idComunidade);
    }

    @DeleteMapping("/{idUsuario}/{idComunidade}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable int idUsuario,
            @PathVariable int idComunidade,
            Authentication authentication) {
        int currentUserId = authenticatedUserService.getCurrentUserId(authentication);

        if (currentUserId == idUsuario) {
            if (communityAuthService.isOwner(currentUserId, idComunidade)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "O dono não pode sair da comunidade");
            }
            participamService.delete(idUsuario, idComunidade);
            return;
        }

        Participam caller = communityAuthService.requireAdminOrOwner(currentUserId, idComunidade);
        Participam target = participamService.findById(idUsuario, idComunidade);

        if (target.getCargo() == Cargo.DONO) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Não é permitido expulsar o dono da comunidade");
        }
        if (target.getCargo() == Cargo.ADMINISTRADOR && caller.getCargo() != Cargo.DONO) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas o dono pode remover um administrador");
        }

        participamService.delete(idUsuario, idComunidade);
    }
}
