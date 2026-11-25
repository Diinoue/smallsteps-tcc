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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.smallsteps.smallsteps.dto.CriarPostRequestDTO;
import com.smallsteps.smallsteps.dto.PostResponseDTO;
import com.smallsteps.smallsteps.security.AuthenticatedUserService;
import com.smallsteps.smallsteps.security.CommunityAuthorizationService;
import com.smallsteps.smallsteps.service.PostService;

@CrossOrigin
@RestController
@RequestMapping("/community/{communityId}/posts")
public class PostController {

    private final PostService postService;
    private final AuthenticatedUserService authenticatedUserService;
    private final CommunityAuthorizationService communityAuthService;

    public PostController(
            PostService postService,
            AuthenticatedUserService authenticatedUserService,
            CommunityAuthorizationService communityAuthService) {
        this.postService = postService;
        this.authenticatedUserService = authenticatedUserService;
        this.communityAuthService = communityAuthService;
    }

    @GetMapping
    public List<PostResponseDTO> getPosts(
            @PathVariable int communityId,
            @RequestParam(required = false) String q) {
        return postService.getPostsByCommunity(communityId, q);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PostResponseDTO createPost(
            @PathVariable int communityId,
            @RequestBody CriarPostRequestDTO dto,
            Authentication authentication) {
        int currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        communityAuthService.requireMember(currentUserId, communityId);
        dto.setIdUsuario(currentUserId);
        return postService.createPost(communityId, dto);
    }

    @DeleteMapping("/{postId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePost(
            @PathVariable int communityId,
            @PathVariable int postId,
            Authentication authentication) {
        int currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        boolean isAdminOrOwner = communityAuthService.isAdminOrOwner(currentUserId, communityId);
        postService.deletePost(communityId, postId, currentUserId, isAdminOrOwner);
    }
}
