package com.smallsteps.smallsteps.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.smallsteps.smallsteps.dto.ComentarioResponseDTO;
import com.smallsteps.smallsteps.dto.CriarComentarioRequestDTO;
import com.smallsteps.smallsteps.entity.Comentario;
import com.smallsteps.smallsteps.entity.Evento;
import com.smallsteps.smallsteps.entity.Post;
import com.smallsteps.smallsteps.entity.Usuario;
import com.smallsteps.smallsteps.repository.ComentarioRepository;
import com.smallsteps.smallsteps.repository.EventoRepository;
import com.smallsteps.smallsteps.repository.PostRepository;
import com.smallsteps.smallsteps.repository.UserRepository;

@Service
public class ComentarioService {

    private final ComentarioRepository comentarioRepository;
    private final PostRepository postRepository;
    private final EventoRepository eventoRepository;
    private final UserRepository userRepository;

    public ComentarioService(
            ComentarioRepository comentarioRepository,
            PostRepository postRepository,
            EventoRepository eventoRepository,
            UserRepository userRepository) {
        this.comentarioRepository = comentarioRepository;
        this.postRepository = postRepository;
        this.eventoRepository = eventoRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<ComentarioResponseDTO> getCommentsByPost(int postId) {
        List<Comentario> comentarios = comentarioRepository.findByPostIdOrderByDtCriacaoAsc(postId);
        return comentarios.stream().map(ComentarioResponseDTO::new).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ComentarioResponseDTO> getCommentsByEvento(int eventoId) {
        List<Comentario> comentarios = comentarioRepository.findByEventoIdOrderByDtCriacaoAsc(eventoId);
        return comentarios.stream().map(ComentarioResponseDTO::new).collect(Collectors.toList());
    }

    @Transactional
    public ComentarioResponseDTO createComment(int postId, CriarComentarioRequestDTO dto) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post não encontrado"));

        Usuario usuario = null;
        if (dto.getIdUsuario() != null && dto.getIdUsuario() > 0) {
            usuario = userRepository.findById(dto.getIdUsuario()).orElse(null);
        }

        if (usuario == null) {
            List<Usuario> usuarios = userRepository.findAll();
            if (!usuarios.isEmpty()) {
                usuario = usuarios.get(0);
            }
        }

        if (usuario == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Usuário não encontrado");
        }

        Comentario comentario = new Comentario();
        comentario.setPost(post);
        comentario.setUsuario(usuario);
        comentario.setConteudo(dto.getConteudo());
        comentario.setDtCriacao(LocalDateTime.now());

        Comentario salvo = comentarioRepository.save(comentario);
        return new ComentarioResponseDTO(salvo);
    }

    @Transactional
    public ComentarioResponseDTO createEventoComment(int eventoId, CriarComentarioRequestDTO dto) {
        Evento evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento não encontrado"));

        Usuario usuario = null;
        if (dto.getIdUsuario() != null && dto.getIdUsuario() > 0) {
            usuario = userRepository.findById(dto.getIdUsuario()).orElse(null);
        }

        if (usuario == null) {
            List<Usuario> usuarios = userRepository.findAll();
            if (!usuarios.isEmpty()) {
                usuario = usuarios.get(0);
            }
        }

        if (usuario == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Usuário não encontrado");
        }

        Comentario comentario = new Comentario();
        comentario.setEvento(evento);
        comentario.setUsuario(usuario);
        comentario.setConteudo(dto.getConteudo());
        comentario.setDtCriacao(LocalDateTime.now());

        Comentario salvo = comentarioRepository.save(comentario);
        return new ComentarioResponseDTO(salvo);
    }

    @Transactional
    public void deleteComment(int commentId) {
        if (!comentarioRepository.existsById(commentId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Comentário não encontrado");
        }
        comentarioRepository.deleteById(commentId);
    }
}
