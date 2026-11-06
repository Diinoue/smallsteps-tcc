package com.smallsteps.smallsteps.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.smallsteps.smallsteps.dto.ComunidadeDTO;
import com.smallsteps.smallsteps.entity.Comunidade;
import com.smallsteps.smallsteps.repository.CommunityRepository;

@Service
public class CommunityService {

    private final CommunityRepository communityRepository;

    public CommunityService(CommunityRepository communityRepository) {
        this.communityRepository = communityRepository;
    }

    public List<Comunidade> findAll() {
        return communityRepository.findAll();
    }

    public Comunidade findById(int id) {
        return communityRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comunidade não encontrada"));
    }

    public Comunidade create(ComunidadeDTO dto) {
        Comunidade comunidade = new Comunidade();
        comunidade.setNome(dto.getNome());
        comunidade.setPrivado(dto.isPrivado());
        comunidade.setFoto(dto.getFoto());
        comunidade.setDtCriacao(dto.getDtCriacao() != null ? dto.getDtCriacao() : LocalDateTime.now());

        return communityRepository.save(comunidade);
    }

    public Comunidade update(int id, ComunidadeDTO dto) {
        Comunidade comunidade = findById(id);

        if (dto.getNome() != null) {
            comunidade.setNome(dto.getNome());
        }
        comunidade.setPrivado(dto.isPrivado());
        if (dto.getFoto() != null) {
            comunidade.setFoto(dto.getFoto());
        }

        return communityRepository.save(comunidade);
    }

    public void delete(int id) {
        if (!communityRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Comunidade não encontrada");
        }
        communityRepository.deleteById(id);
    }
}
