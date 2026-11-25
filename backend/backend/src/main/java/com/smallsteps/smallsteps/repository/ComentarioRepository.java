package com.smallsteps.smallsteps.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.smallsteps.smallsteps.entity.Comentario;

public interface ComentarioRepository extends JpaRepository<Comentario, Integer> {
    @Query("SELECT c FROM Comentario c JOIN FETCH c.usuario WHERE c.post.id = :postId ORDER BY c.dtCriacao ASC")
    List<Comentario> findByPostIdOrderByDtCriacaoAsc(@Param("postId") int postId);

    int countByPostId(int postId);

    @Query("SELECT c FROM Comentario c JOIN FETCH c.usuario WHERE c.evento.id = :eventoId ORDER BY c.dtCriacao ASC")
    List<Comentario> findByEventoIdOrderByDtCriacaoAsc(@Param("eventoId") int eventoId);

    int countByEventoId(int eventoId);

    void deleteByPostId(int postId);

    void deleteByEventoId(int eventoId);
}
