package com.smallsteps.smallsteps.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smallsteps.smallsteps.entity.Tag;

public interface TagRepository extends JpaRepository<Tag, Integer> {
    Optional<Tag> findByDescricaoIgnoreCase(String descricao);
    Optional<Tag> findByDescricao(String descricao);
    List<Tag> findAllByOrderByDescricaoAsc();
    List<Tag> findByDescricaoContainingIgnoreCaseOrderByDescricaoAsc(String descricao);
}
