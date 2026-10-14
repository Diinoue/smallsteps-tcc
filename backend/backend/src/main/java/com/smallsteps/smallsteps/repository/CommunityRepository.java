package com.smallsteps.smallsteps.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smallsteps.smallsteps.entity.Comunidade;

public interface CommunityRepository extends JpaRepository<Comunidade, Integer>{
}