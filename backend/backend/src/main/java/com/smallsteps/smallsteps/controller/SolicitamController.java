package com.smallsteps.smallsteps.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.smallsteps.smallsteps.dto.SolicitacaoResponseDTO;
import com.smallsteps.smallsteps.dto.SolicitamDTO;
import com.smallsteps.smallsteps.entity.Participam;
import com.smallsteps.smallsteps.entity.Solicitam;
import com.smallsteps.smallsteps.security.AuthenticatedUserService;
import com.smallsteps.smallsteps.security.CommunityAuthorizationService;
import com.smallsteps.smallsteps.service.SolicitamService;

@CrossOrigin
@RestController
@RequestMapping("/solicitam")
public class SolicitamController {

    private final SolicitamService solicitamService;
    private final AuthenticatedUserService authenticatedUserService;
    private final CommunityAuthorizationService communityAuthService;

    public SolicitamController(
            SolicitamService solicitamService,
            AuthenticatedUserService authenticatedUserService,
            CommunityAuthorizationService communityAuthService) {
        this.solicitamService = solicitamService;
        this.authenticatedUserService = authenticatedUserService;
        this.communityAuthService = communityAuthService;
    }

    @GetMapping("/comunidade/{idComunidade}")
    public List<SolicitacaoResponseDTO> getByComunidade(
            @PathVariable int idComunidade,
            Authentication authentication) {
        int currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        communityAuthService.requireAdminOrOwner(currentUserId, idComunidade);
        return solicitamService.findByComunidade(idComunidade);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Solicitam create(@RequestBody SolicitamDTO dto, Authentication authentication) {
        dto.idUsuario = authenticatedUserService.getCurrentUserId(authentication);
        return solicitamService.create(dto);
    }

    @PostMapping("/{idComunidade}/{idUsuario}/aceitar")
    public Participam accept(
            @PathVariable int idComunidade,
            @PathVariable int idUsuario,
            Authentication authentication) {
        int currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        communityAuthService.requireAdminOrOwner(currentUserId, idComunidade);
        return solicitamService.accept(idComunidade, idUsuario);
    }

    @DeleteMapping("/{idComunidade}/{idUsuario}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void reject(
            @PathVariable int idComunidade,
            @PathVariable int idUsuario,
            Authentication authentication) {
        int currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        communityAuthService.requireAdminOrOwner(currentUserId, idComunidade);
        solicitamService.reject(idComunidade, idUsuario);
    }
}
