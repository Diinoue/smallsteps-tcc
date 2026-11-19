package com.smallsteps.smallsteps.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.smallsteps.smallsteps.entity.TagUsuario;
import com.smallsteps.smallsteps.entity.TagUsuarioId;

public interface TagUsuarioRepository extends JpaRepository<TagUsuario, TagUsuarioId> {
    
    List<TagUsuario> findByIdUsuario(int idUsuario);

    @Transactional
    @Modifying
    @Query("delete from TagUsuario tu where tu.idUsuario = :idUsuario")
    void deleteByIdUsuario(@Param("idUsuario") int idUsuario);
}
