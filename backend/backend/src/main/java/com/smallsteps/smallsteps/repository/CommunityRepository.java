package com.smallsteps.smallsteps.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smallsteps.smallsteps.entity.Comunidade;

public interface CommunityRepository extends JpaRepository<Comunidade, Integer> {
    List<Comunidade> findByPrivadoFalse();
    List<Comunidade> findByPrivadoFalseAndNomeContainingIgnoreCase(String nome);
}
