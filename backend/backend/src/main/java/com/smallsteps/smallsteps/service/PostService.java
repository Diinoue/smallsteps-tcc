package com.smallsteps.smallsteps.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.smallsteps.smallsteps.dto.CriarPostRequestDTO;
import com.smallsteps.smallsteps.dto.PostResponseDTO;
import com.smallsteps.smallsteps.entity.Comunidade;
import com.smallsteps.smallsteps.entity.Post;
import com.smallsteps.smallsteps.entity.Usuario;
import com.smallsteps.smallsteps.repository.CommunityRepository;
import com.smallsteps.smallsteps.repository.PostRepository;
import com.smallsteps.smallsteps.repository.UserRepository;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final CommunityRepository communityRepository;
    private final UserRepository userRepository;

    public PostService(
            PostRepository postRepository,
            CommunityRepository communityRepository,
            UserRepository userRepository) {
        this.postRepository = postRepository;
        this.communityRepository = communityRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<PostResponseDTO> getPostsByCommunity(int communityId) {
        List<Post> posts = postRepository.findByComunidadeIdOrderByDtCriacaoDesc(communityId);
        return posts.stream()
                .map(p -> {
                    int streak = p.getUsuario() != null ? p.getUsuario().getStreakNum() : 0;
                    int commentsCount = 0; // Pode ser integrado com ComentarioRepository posteriormente
                    return new PostResponseDTO(p, streak, commentsCount);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public PostResponseDTO createPost(int communityId, CriarPostRequestDTO dto) {
        Comunidade comunidade = communityRepository.findById(communityId)
                .orElseThrow(() -> new RuntimeException("Comunidade não encontrada com id: " + communityId));

        Usuario usuario = null;
        if (dto.getIdUsuario() != null && dto.getIdUsuario() > 0) {
            usuario = userRepository.findById(dto.getIdUsuario()).orElse(null);
        }

        // Fallback de teste se idUsuario não for informado
        if (usuario == null) {
            List<Usuario> usuarios = userRepository.findAll();
            if (!usuarios.isEmpty()) {
                usuario = usuarios.get(0);
            }
        }

        if (usuario == null) {
            throw new RuntimeException("Usuário não encontrado para criar o post");
        }

        Post post = new Post();
        post.setComunidade(comunidade);
        post.setUsuario(usuario);
        post.setDescricao(dto.getDescricao());
        post.setTipoMidia(dto.getTipoMidia() != null ? dto.getTipoMidia().toUpperCase() : "TEXT");
        post.setUrlMidia(dto.getUrlMidia());
        post.setUrlThumbnail(dto.getUrlThumbnail());
        post.setDtCriacao(LocalDateTime.now());

        Post salvo = postRepository.save(post);
        return new PostResponseDTO(salvo, usuario.getStreakNum(), 0);
    }

    @Transactional
    public void deletePost(int communityId, int postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post não encontrado"));

        if (post.getComunidade().getId() != communityId) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Post não pertence a esta comunidade");
        }

        postRepository.delete(post);
    }
}
