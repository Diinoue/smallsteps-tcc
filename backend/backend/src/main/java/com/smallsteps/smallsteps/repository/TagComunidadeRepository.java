package com.smallsteps.smallsteps.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smallsteps.smallsteps.entity.TagComunidade;
import com.smallsteps.smallsteps.entity.TagComunidadeId;

public interface TagComunidadeRepository extends JpaRepository<TagComunidade, TagComunidadeId> {
    List<TagComunidade> findByIdComunidade(int idComunidade);
    void deleteByIdComunidade(int idComunidade);
}
