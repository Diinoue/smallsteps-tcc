package com.smallsteps.smallsteps.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smallsteps.smallsteps.entity.SubMeta;

public interface SubMetaRepository extends JpaRepository<SubMeta, Integer> {
    List<SubMeta> findByMetaIdOrderByPos(int metaId);
    void deleteByMetaId(int metaId);
}
