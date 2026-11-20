package com.smallsteps.smallsteps.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.smallsteps.smallsteps.dto.ComunidadeDTO;
import com.smallsteps.smallsteps.entity.Comunidade;
import com.smallsteps.smallsteps.entity.Participam;
import com.smallsteps.smallsteps.entity.ParticipamId;
import com.smallsteps.smallsteps.entity.Tag;
import com.smallsteps.smallsteps.entity.TagComunidade;
import com.smallsteps.smallsteps.entity.Usuario;
import com.smallsteps.smallsteps.enums.Cargo;
import com.smallsteps.smallsteps.repository.CommunityRepository;
import com.smallsteps.smallsteps.repository.ParticipamRepository;
import com.smallsteps.smallsteps.repository.TagComunidadeRepository;
import com.smallsteps.smallsteps.repository.TagRepository;
import com.smallsteps.smallsteps.repository.UserRepository;

@Service
public class CommunityService {

    private final CommunityRepository communityRepository;
    private final ParticipamRepository participamRepository;
    private final UserRepository userRepository;
    private final TagRepository tagRepository;
    private final TagComunidadeRepository tagComunidadeRepository;

    public CommunityService(
            CommunityRepository communityRepository,
            ParticipamRepository participamRepository,
            UserRepository userRepository,
            TagRepository tagRepository,
            TagComunidadeRepository tagComunidadeRepository) {
        this.communityRepository = communityRepository;
        this.participamRepository = participamRepository;
        this.userRepository = userRepository;
        this.tagRepository = tagRepository;
        this.tagComunidadeRepository = tagComunidadeRepository;
    }

    @Transactional(readOnly = true)
    public List<Comunidade> findAll() {
        return communityRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Comunidade findById(int id) {
        return communityRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comunidade não encontrada"));
    }

    @Transactional
    public Comunidade create(ComunidadeDTO dto) {
        Comunidade comunidade = new Comunidade();
        comunidade.setNome(dto.getNome());
        comunidade.setPrivado(dto.isPrivado());
        comunidade.setFoto(dto.getFoto());
        comunidade.setDescricao(dto.getDescricao());
        comunidade.setDtCriacao(dto.getDtCriacao() != null ? dto.getDtCriacao() : LocalDateTime.now());

        Comunidade salva = communityRepository.save(comunidade);

        // Associa o criador da comunidade como DONO na tabela participam
        Integer idUsuario = dto.getIdUsuario();
        if (idUsuario == null || idUsuario <= 0) {
            Usuario primeiro = userRepository.findAll().stream().findFirst().orElse(null);
            if (primeiro != null) {
                idUsuario = primeiro.getId();
            }
        }

        if (idUsuario != null && idUsuario > 0) {
            Participam participam = new Participam();
            participam.setIdUsuario(idUsuario);
            participam.setIdComunidade(salva.getId());
            participam.setPontos(0);
            participam.setCargo(Cargo.DONO);
            participam.setDtInicio(LocalDateTime.now());
            participamRepository.save(participam);
        }

        // Associa as tags se fornecidas
        if (dto.getTags() != null && !dto.getTags().isEmpty()) {
            for (String tagStr : dto.getTags()) {
                if (tagStr != null && !tagStr.trim().isEmpty()) {
                    String limpa = tagStr.trim().replaceAll("^#", "");
                    if (!limpa.isEmpty()) {
                        Tag tag = tagRepository.findByDescricaoIgnoreCase(limpa)
                                .orElseGet(() -> tagRepository.save(new Tag(0, limpa)));

                        TagComunidade tagCom = new TagComunidade(tag.getId(), salva.getId());
                        tagComunidadeRepository.save(tagCom);
                    }
                }
            }
        }

        return salva;
    }

    @Transactional
    public Comunidade update(int id, ComunidadeDTO dto) {
        Comunidade comunidade = findById(id);

        if (dto.getNome() != null) {
            comunidade.setNome(dto.getNome());
        }
        comunidade.setPrivado(dto.isPrivado());
        if (dto.getFoto() != null) {
            comunidade.setFoto(dto.getFoto());
        }
        if (dto.getDescricao() != null) {
            comunidade.setDescricao(dto.getDescricao());
        }

        return communityRepository.save(comunidade);
    }

    @Transactional
    public void delete(int id) {
        if (!communityRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Comunidade não encontrada");
        }
        communityRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<ComunidadeDTO> findPublicCommunities(String nome, Integer idUsuario) {
        List<Comunidade> comunidades;
        if (nome != null && !nome.trim().isEmpty()) {
            comunidades = communityRepository.findByPrivadoFalseAndNomeContainingIgnoreCase(nome.trim());
        } else {
            comunidades = communityRepository.findByPrivadoFalse();
        }

        return comunidades.stream()
                .filter(c -> {
                    // Não exibe comunidades que o usuário já participa
                    if (idUsuario != null && idUsuario > 0) {
                        return !participamRepository.existsById(new ParticipamId(idUsuario, c.getId()));
                    }
                    return true;
                })
                .map(c -> {
                    ComunidadeDTO dto = new ComunidadeDTO();
                    dto.setId(c.getId());
                    dto.setNome(c.getNome());
                    dto.setPrivado(c.isPrivado());
                    dto.setFoto(c.getFoto());
                    dto.setDescricao(c.getDescricao());
                    dto.setDtCriacao(c.getDtCriacao());

                    // Carrega tags associadas à comunidade
                    List<TagComunidade> tagComunidades = tagComunidadeRepository.findByIdComunidade(c.getId());
                    List<String> tags = tagComunidades.stream()
                            .map(tc -> tagRepository.findById(tc.getIdTag()).map(Tag::getDescricao).orElse(null))
                            .filter(Objects::nonNull)
                            .collect(Collectors.toList());
                    dto.setTags(tags);
                    dto.setJaParticipa(false);

                    return dto;
                }).collect(Collectors.toList());
    }
}
