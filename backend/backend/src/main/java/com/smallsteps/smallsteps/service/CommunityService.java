package com.smallsteps.smallsteps.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.smallsteps.smallsteps.dto.ComunidadeDTO;
import com.smallsteps.smallsteps.entity.Comunidade;
import com.smallsteps.smallsteps.entity.Participam;
import com.smallsteps.smallsteps.entity.ParticipamId;
import com.smallsteps.smallsteps.entity.SolicitamId;
import com.smallsteps.smallsteps.entity.Tag;
import com.smallsteps.smallsteps.entity.TagComunidade;
import com.smallsteps.smallsteps.entity.Usuario;
import com.smallsteps.smallsteps.enums.Cargo;
import com.smallsteps.smallsteps.repository.CommunityRepository;
import com.smallsteps.smallsteps.repository.ParticipamRepository;
import com.smallsteps.smallsteps.repository.SolicitamRepository;
import com.smallsteps.smallsteps.repository.TagComunidadeRepository;
import com.smallsteps.smallsteps.repository.TagRepository;
import com.smallsteps.smallsteps.repository.UserRepository;

@Service
public class CommunityService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final Pattern INVITE_CODE_PATTERN = Pattern.compile("#?[0-9a-fA-F]{6}");

    private final CommunityRepository communityRepository;
    private final ParticipamRepository participamRepository;
    private final SolicitamRepository solicitamRepository;
    private final UserRepository userRepository;
    private final TagRepository tagRepository;
    private final TagComunidadeRepository tagComunidadeRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public CommunityService(
            CommunityRepository communityRepository,
            ParticipamRepository participamRepository,
            SolicitamRepository solicitamRepository,
            UserRepository userRepository,
            TagRepository tagRepository,
            TagComunidadeRepository tagComunidadeRepository) {
        this.communityRepository = communityRepository;
        this.participamRepository = participamRepository;
        this.solicitamRepository = solicitamRepository;
        this.userRepository = userRepository;
        this.tagRepository = tagRepository;
        this.tagComunidadeRepository = tagComunidadeRepository;
    }

    private String generateUniqueInviteCode() {
        for (int attempt = 0; attempt < 50; attempt++) {
            int value = RANDOM.nextInt(0x1000000);
            String code = String.format("#%06x", value);
            if (!communityRepository.existsByCodigoConviteIgnoreCase(code)) {
                return code;
            }
        }
        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Não foi possível gerar código único de convite");
    }

    private String normalizeInviteCode(String rawInput) {
        if (rawInput == null || rawInput.trim().isEmpty()) {
            return "";
        }
        String trimmed = rawInput.trim();
        Matcher matcher = INVITE_CODE_PATTERN.matcher(trimmed);
        String found = null;
        while (matcher.find()) {
            found = matcher.group();
        }
        if (found != null) {
            return found.startsWith("#") ? found.toLowerCase() : "#" + found.toLowerCase();
        }
        return trimmed.startsWith("#") ? trimmed.toLowerCase() : "#" + trimmed.toLowerCase();
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

    @Transactional(readOnly = true)
    public ComunidadeDTO findDetailsById(int id, Integer idUsuario) {
        Comunidade comunidade = findById(id);
        return toComunidadeDTO(comunidade, idUsuario);
    }

    @Transactional
    public Comunidade create(ComunidadeDTO dto) {
        Comunidade comunidade = new Comunidade();
        comunidade.setNome(dto.getNome());
        comunidade.setPrivado(dto.isPrivado());
        comunidade.setFoto(dto.getFoto());
        comunidade.setDescricao(dto.getDescricao());
        comunidade.setDtCriacao(dto.getDtCriacao() != null ? dto.getDtCriacao() : LocalDateTime.now());
        comunidade.setCodigoConvite(generateUniqueInviteCode());

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

        if (dto.getNome() != null && !dto.getNome().trim().isEmpty()) {
            comunidade.setNome(dto.getNome().trim());
        }
        comunidade.setPrivado(dto.isPrivado());
        if (dto.getFoto() != null) {
            comunidade.setFoto(dto.getFoto().trim().isEmpty() ? null : dto.getFoto().trim());
        }
        if (dto.getDescricao() != null) {
            comunidade.setDescricao(dto.getDescricao().trim().isEmpty() ? null : dto.getDescricao().trim());
        }

        Comunidade salva = communityRepository.save(comunidade);

        // Atualiza tags se fornecidas no payload
        if (dto.getTags() != null) {
            tagComunidadeRepository.deleteByIdComunidade(id);
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
    public void delete(int id) {
        if (!communityRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Comunidade não encontrada");
        }

        // Remove registros filhos antes de deletar a comunidade para evitar violação de FK
        entityManager.createNativeQuery(
                "DELETE FROM comentario WHERE id_post IN (SELECT id FROM post WHERE id_comunidade = :id)")
                .setParameter("id", id)
                .executeUpdate();
        entityManager.createNativeQuery(
                "DELETE FROM comentario WHERE id_evento IN (SELECT id FROM evento WHERE id_comunidade = :id)")
                .setParameter("id", id)
                .executeUpdate();
        entityManager.createNativeQuery("DELETE FROM post WHERE id_comunidade = :id")
                .setParameter("id", id)
                .executeUpdate();
        entityManager.createNativeQuery("DELETE FROM evento WHERE id_comunidade = :id")
                .setParameter("id", id)
                .executeUpdate();
        entityManager.createNativeQuery("DELETE FROM tag_comunidade WHERE id_comunidade = :id")
                .setParameter("id", id)
                .executeUpdate();
        entityManager.createNativeQuery("DELETE FROM solicitam WHERE id_comunidade = :id")
                .setParameter("id", id)
                .executeUpdate();
        entityManager.createNativeQuery("DELETE FROM participam WHERE id_comunidade = :id")
                .setParameter("id", id)
                .executeUpdate();

        communityRepository.deleteById(id);
    }

    private ComunidadeDTO toComunidadeDTO(Comunidade c, Integer idUsuario) {
        ComunidadeDTO dto = new ComunidadeDTO();
        dto.setId(c.getId());
        dto.setNome(c.getNome());
        dto.setPrivado(c.isPrivado());
        dto.setFoto(c.getFoto());
        dto.setDescricao(c.getDescricao());
        dto.setDtCriacao(c.getDtCriacao());
        dto.setCodigoConvite(c.getCodigoConvite());
        dto.setQuantidadeMembros((int) participamRepository.countByIdComunidade(c.getId()));

        List<TagComunidade> tagComunidades = tagComunidadeRepository.findByIdComunidade(c.getId());
        List<String> tags = tagComunidades.stream()
                .map(tc -> tagRepository.findById(tc.getIdTag()).map(Tag::getDescricao).orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        dto.setTags(tags);

        boolean jaParticipa = false;
        boolean jaSolicitou = false;
        if (idUsuario != null && idUsuario > 0) {
            jaParticipa = participamRepository.existsById(new ParticipamId(idUsuario, c.getId()));
            jaSolicitou = solicitamRepository.existsById(new SolicitamId(idUsuario, c.getId()));
        }
        dto.setJaParticipa(jaParticipa);
        dto.setJaSolicitou(jaSolicitou);

        return dto;
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
                .map(c -> toComunidadeDTO(c, idUsuario))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ComunidadeDTO findByInviteCode(String rawCode, Integer idUsuario) {
        String normalized = normalizeInviteCode(rawCode);
        if (normalized.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Código de convite inválido");
        }

        Comunidade comunidade = communityRepository.findByCodigoConviteIgnoreCase(normalized)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comunidade não encontrada para o código informado"));

        return toComunidadeDTO(comunidade, idUsuario);
    }

    @Transactional
    public Comunidade rerollInviteCode(int id) {
        Comunidade comunidade = findById(id);
        String current = comunidade.getCodigoConvite();
        String newCode = generateUniqueInviteCode();
        while (newCode.equalsIgnoreCase(current)) {
            newCode = generateUniqueInviteCode();
        }
        comunidade.setCodigoConvite(newCode);
        return communityRepository.save(comunidade);
    }
}
