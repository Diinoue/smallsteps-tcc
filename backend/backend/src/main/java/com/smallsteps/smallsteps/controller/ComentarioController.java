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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.smallsteps.smallsteps.dto.ComentarioResponseDTO;
import com.smallsteps.smallsteps.dto.CriarComentarioRequestDTO;
import com.smallsteps.smallsteps.security.AuthenticatedUserService;
import com.smallsteps.smallsteps.security.CommunityAuthorizationService;
import com.smallsteps.smallsteps.service.ComentarioService;

@CrossOrigin
@RestController
public class ComentarioController {

    private final ComentarioService comentarioService;
    private final AuthenticatedUserService authenticatedUserService;
    private final CommunityAuthorizationService communityAuthService;

    public ComentarioController(
            ComentarioService comentarioService,
            AuthenticatedUserService authenticatedUserService,
            CommunityAuthorizationService communityAuthService) {
        this.comentarioService = comentarioService;
        this.authenticatedUserService = authenticatedUserService;
        this.communityAuthService = communityAuthService;
    }

    @GetMapping("/posts/{postId}/comments")
    public List<ComentarioResponseDTO> getComments(@PathVariable int postId) {
        return comentarioService.getCommentsByPost(postId);
    }

    @PostMapping("/posts/{postId}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public ComentarioResponseDTO createComment(
            @PathVariable int postId,
            @RequestBody CriarComentarioRequestDTO dto,
            Authentication authentication) {
        int currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        int communityId = comentarioService.getCommunityIdByPostId(postId);
        communityAuthService.requireMember(currentUserId, communityId);
        dto.setIdUsuario(currentUserId);
        return comentarioService.createComment(postId, dto);
    }

    @GetMapping("/events/{eventId}/comments")
    public List<ComentarioResponseDTO> getEventComments(@PathVariable int eventId) {
        return comentarioService.getCommentsByEvento(eventId);
    }

    @PostMapping("/events/{eventId}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public ComentarioResponseDTO createEventComment(
            @PathVariable int eventId,
            @RequestBody CriarComentarioRequestDTO dto,
            Authentication authentication) {
        int currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        int communityId = comentarioService.getCommunityIdByEventId(eventId);
        communityAuthService.requireMember(currentUserId, communityId);
        dto.setIdUsuario(currentUserId);
        return comentarioService.createEventoComment(eventId, dto);
    }

    // Exclusão de comentários restrita a ADMINISTRADOR ou DONO da comunidade (UC025)
    @DeleteMapping("/comments/{commentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteComment(@PathVariable int commentId, Authentication authentication) {
        int currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        int communityId = comentarioService.getCommunityIdByCommentId(commentId);
        communityAuthService.requireAdminOrOwner(currentUserId, communityId);
        comentarioService.deleteComment(commentId);
    }
}
