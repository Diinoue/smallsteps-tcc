package com.smallsteps.smallsteps.controller;

import java.util.List;
import java.util.stream.Collectors;

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

import com.smallsteps.smallsteps.dto.ComunidadeDTO;
import com.smallsteps.smallsteps.entity.Comunidade;
import com.smallsteps.smallsteps.security.AuthenticatedUserService;
import com.smallsteps.smallsteps.security.CommunityAuthorizationService;
import com.smallsteps.smallsteps.service.CommunityService;

@CrossOrigin
@RestController
@RequestMapping("/community")
public class CommunityController {

    private final CommunityService communityService;
    private final AuthenticatedUserService authenticatedUserService;
    private final CommunityAuthorizationService communityAuthService;

    public CommunityController(
            CommunityService communityService,
            AuthenticatedUserService authenticatedUserService,
            CommunityAuthorizationService communityAuthService) {
        this.communityService = communityService;
        this.authenticatedUserService = authenticatedUserService;
        this.communityAuthService = communityAuthService;
    }

    private Comunidade maskPrivateInviteCodeIfNeeded(Comunidade c, int currentUserId) {
        if (!c.isPrivado() || communityAuthService.isAdminOrOwner(currentUserId, c.getId())) {
            return c;
        }
        Comunidade copy = new Comunidade();
        copy.setId(c.getId());
        copy.setNome(c.getNome());
        copy.setPrivado(c.isPrivado());
        copy.setFoto(c.getFoto());
        copy.setDescricao(c.getDescricao());
        copy.setDtCriacao(c.getDtCriacao());
        copy.setCodigoConvite(null);
        return copy;
    }

    @GetMapping
    public List<Comunidade> getAll(Authentication authentication) {
        int currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        return communityService.findAll().stream()
                .map(c -> maskPrivateInviteCodeIfNeeded(c, currentUserId))
                .collect(Collectors.toList());
    }

    @GetMapping("/public")
    public List<ComunidadeDTO> getPublic(
            @RequestParam(required = false) String nome,
            Authentication authentication) {
        int currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        return communityService.findPublicCommunities(nome, currentUserId);
    }

    @GetMapping("/by-code")
    public ComunidadeDTO getByCode(
            @RequestParam String codigo,
            Authentication authentication) {
        int currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        return communityService.findByInviteCode(codigo, currentUserId);
    }

    @PostMapping("/{id}/reroll-code")
    public Comunidade rerollCode(@PathVariable int id, Authentication authentication) {
        int currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        communityAuthService.requireAdminOrOwner(currentUserId, id);
        return communityService.rerollInviteCode(id);
    }

    @GetMapping("/{id}")
    public Comunidade getById(@PathVariable int id, Authentication authentication) {
        int currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        return maskPrivateInviteCodeIfNeeded(communityService.findById(id), currentUserId);
    }

    @GetMapping("/{id}/details")
    public ComunidadeDTO getDetailsById(
            @PathVariable int id,
            Authentication authentication) {
        int currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        ComunidadeDTO dto = communityService.findDetailsById(id, currentUserId);
        if (dto.isPrivado() && !communityAuthService.isAdminOrOwner(currentUserId, id)) {
            dto.setCodigoConvite(null);
        }
        return dto;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Comunidade create(@RequestBody ComunidadeDTO dto, Authentication authentication) {
        dto.setIdUsuario(authenticatedUserService.getCurrentUserId(authentication));
        return communityService.create(dto);
    }

    @PutMapping("/{id}")
    public Comunidade update(
            @PathVariable int id,
            @RequestBody ComunidadeDTO dto,
            Authentication authentication) {
        int currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        communityAuthService.requireAdminOrOwner(currentUserId, id);
        return communityService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable int id, Authentication authentication) {
        int currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        communityAuthService.requireOwner(currentUserId, id);
        communityService.delete(id);
    }
}
