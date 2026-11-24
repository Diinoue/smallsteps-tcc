package com.smallsteps.smallsteps.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
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
import com.smallsteps.smallsteps.service.PostService;

@CrossOrigin
@RestController
@RequestMapping("/community/{communityId}/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
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
            @RequestBody CriarPostRequestDTO dto) {
        return postService.createPost(communityId, dto);
    }

    @DeleteMapping("/{postId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePost(
            @PathVariable int communityId,
            @PathVariable int postId) {
        postService.deletePost(communityId, postId);
    }
}
