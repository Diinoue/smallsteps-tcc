package com.smallsteps.smallsteps.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smallsteps.smallsteps.entity.Solicitam;
import com.smallsteps.smallsteps.entity.SolicitamId;

public interface SolicitamRepository extends JpaRepository<Solicitam, SolicitamId> {
    List<Solicitam> findByIdComunidadeOrderByDtInicioDesc(int idComunidade);
    List<Solicitam> findByIdUsuario(int idUsuario);
}
