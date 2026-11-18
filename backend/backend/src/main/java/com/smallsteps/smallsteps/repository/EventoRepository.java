package com.smallsteps.smallsteps.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.smallsteps.smallsteps.entity.Evento;

public interface EventoRepository extends JpaRepository<Evento, Integer> {

    @Query("SELECT e FROM Evento e JOIN FETCH e.usuario WHERE e.comunidade.id = :comunidadeId ORDER BY e.diaInicio ASC, e.horarioInicio ASC")
    List<Evento> findByComunidadeIdOrderByDiaInicioAsc(@Param("comunidadeId") int comunidadeId);
}
