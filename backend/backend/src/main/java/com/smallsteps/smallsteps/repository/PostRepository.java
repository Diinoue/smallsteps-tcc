package com.smallsteps.smallsteps.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.smallsteps.smallsteps.entity.Post;

public interface PostRepository extends JpaRepository<Post, Integer> {
    @Query("SELECT p FROM Post p JOIN FETCH p.usuario WHERE p.comunidade.id = :comunidadeId ORDER BY p.dtCriacao DESC, p.id DESC")
    List<Post> findByComunidadeIdOrderByDtCriacaoDesc(@Param("comunidadeId") int comunidadeId);
}
