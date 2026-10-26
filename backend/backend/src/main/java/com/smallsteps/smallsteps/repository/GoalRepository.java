package com.smallsteps.smallsteps.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.smallsteps.smallsteps.entity.Meta;
import com.smallsteps.smallsteps.entity.SubMeta;

public interface GoalRepository extends JpaRepository<Meta, Integer> {

    List<Meta> findByUsuarioIdAndConcluidoFalse(int idUsuario);

    @Query("""
        select s from SubMeta s
        where s.meta.usuario.id = :idUsuario
          and s.meta.concluido = false
        order by s.meta.id, s.pos
        """)
    List<SubMeta> findSubMetasByUsuario(@Param("idUsuario") int idUsuario);
}