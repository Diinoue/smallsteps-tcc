package com.smallsteps.smallsteps.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smallsteps.smallsteps.entity.Participam;
import com.smallsteps.smallsteps.entity.ParticipamId;

public interface ParticipamRepository extends JpaRepository<Participam, ParticipamId> {
    List<Participam> findByIdUsuario(int idUsuario);
    List<Participam> findByIdComunidade(int idComunidade);
}
