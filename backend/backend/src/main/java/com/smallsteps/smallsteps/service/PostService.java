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
import com.smallsteps.smallsteps.repository.ComentarioRepository;
import com.smallsteps.smallsteps.repository.PostRepository;
import com.smallsteps.smallsteps.repository.UserRepository;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final CommunityRepository communityRepository;
    private final UserRepository userRepository;
    private final ComentarioRepository comentarioRepository;
    private final StreakService streakService;

    public PostService(
            PostRepository postRepository,
            CommunityRepository communityRepository,
            UserRepository userRepository,
            ComentarioRepository comentarioRepository,
            StreakService streakService) {
        this.postRepository = postRepository;
        this.communityRepository = communityRepository;
        this.userRepository = userRepository;
        this.comentarioRepository = comentarioRepository;
        this.streakService = streakService;
    }

    @Transactional(readOnly = true)
    public List<PostResponseDTO> getPostsByCommunity(int communityId, String query) {
        List<Post> posts = (query != null && !query.trim().isEmpty())
                ? postRepository.searchByComunidadeId(communityId, query.trim())
                : postRepository.findByComunidadeIdOrderByDtCriacaoDesc(communityId);
        return posts.stream()
                .map(p -> {
                    int streak = p.getUsuario() != null ? p.getUsuario().getStreakNum() : 0;
                    int commentsCount = comentarioRepository.countByPostId(p.getId());
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

        // Fallback determinístico se idUsuario não for informado (usuário 1 no modo de testes)
        if (usuario == null) {
            usuario = userRepository.findById(1).orElseGet(() ->
                userRepository.findAll().stream()
                    .min(java.util.Comparator.comparingInt(Usuario::getId))
                    .orElse(null)
            );
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
        post.setDtCriacao(LocalDateTime.now());

        Post salvo = postRepository.save(post);
        streakService.registrarAtividadePorPost(usuario, communityId);
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
