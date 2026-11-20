package com.smallsteps.smallsteps.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.smallsteps.smallsteps.dto.DashboardDTOResponse;
import com.smallsteps.smallsteps.dto.GoalDTOResponse;
import com.smallsteps.smallsteps.dto.ProfileAchievementDTO;
import com.smallsteps.smallsteps.dto.ProfileCurrentGoalDTO;
import com.smallsteps.smallsteps.dto.ProfileDTOResponse;
import com.smallsteps.smallsteps.dto.ProfileTimelineNodeDTO;
import com.smallsteps.smallsteps.dto.SubGoalDTOResponse;
import com.smallsteps.smallsteps.dto.TagDTO;
import com.smallsteps.smallsteps.dto.UpdateProfileDTORequest;
import com.smallsteps.smallsteps.entity.Meta;
import com.smallsteps.smallsteps.entity.SubMeta;
import com.smallsteps.smallsteps.entity.Tag;
import com.smallsteps.smallsteps.entity.TagUsuario;
import com.smallsteps.smallsteps.entity.Usuario;
import com.smallsteps.smallsteps.repository.GoalRepository;
import com.smallsteps.smallsteps.repository.TagRepository;
import com.smallsteps.smallsteps.repository.TagUsuarioRepository;
import com.smallsteps.smallsteps.repository.UserRepository;
import com.smallsteps.smallsteps.security.UserAuthenticated;

@Service 
public class UserService implements UserServiceDetails {
    
    private final UserRepository userRepository;
    private final GoalRepository goalRepository;
    private final TagRepository tagRepository;
    private final TagUsuarioRepository tagUsuarioRepository;

    public UserService(
            UserRepository userRepository,
            GoalRepository goalRepository,
            TagRepository tagRepository,
            TagUsuarioRepository tagUsuarioRepository) {
        this.userRepository = userRepository;
        this.goalRepository = goalRepository;
        this.tagRepository = tagRepository;
        this.tagUsuarioRepository = tagUsuarioRepository;
    }

    public List<Usuario> readUsuario() {
        return userRepository.findAll();
    }

    @Transactional(readOnly = true)
    public DashboardDTOResponse getDashboard(int idUsuario) {
        Usuario usuario = userRepository.findById(idUsuario)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Usuário não encontrado"));

        List<Meta> metas = goalRepository.findByUsuarioIdAndConcluidoFalse(idUsuario);

        Map<Integer, List<SubMeta>> subMetasPorMeta = goalRepository
                .findSubMetasByUsuario(idUsuario)
                .stream()
                .collect(Collectors.groupingBy(SubMeta::getIdMeta));

        DashboardDTOResponse dashboard = new DashboardDTOResponse();
        dashboard.streakNum = usuario.getStreakNum();
        dashboard.ultimaAtividade = usuario.getUltimaAtividade();
        dashboard.ultimoPrazo = usuario.getUltimoPrazo();
        dashboard.intervaloAtividade = usuario.getIntervaloAtividade();

        for (Meta meta : metas) {
            GoalDTOResponse goalDto = new GoalDTOResponse();
            goalDto.id = meta.getId();
            goalDto.title = meta.getTitulo();
            goalDto.concluido = meta.isConcluido();
            goalDto.dtInicio = meta.getDtInicio();
            goalDto.dtFim = meta.getDtFim();

            for (SubMeta sub : subMetasPorMeta.getOrDefault(meta.getId(), List.of())) {
                SubGoalDTOResponse subDto = new SubGoalDTOResponse();
                subDto.id = sub.getId();
                subDto.concluido = sub.isConcluido();
                subDto.titulo = sub.getTitulo();
                subDto.dtInicio = sub.getDtInicio();
                subDto.dtFim = sub.getDtFim();
                subDto.pos = sub.getPos();
                goalDto.subMetas.add(subDto);
            }

            dashboard.metas.add(goalDto);
        }

        return dashboard;
    }

    /**
     * Retorna o perfil completo do usuário buscando por e-mail (usuário logado via token JWT)
     */
    public ProfileDTOResponse getProfileByEmail(String email) {
        Usuario usuario = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Usuário não encontrado com e-mail: " + email));
        return buildProfileDTO(usuario);
    }

    /**
     * Retorna o perfil por ID (para perfil próprio ou perfil público de terceiros)
     */
    public ProfileDTOResponse getProfileById(int idUsuario) {
        Usuario usuario = userRepository.findById(idUsuario)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Usuário não encontrado com ID: " + idUsuario));
        return buildProfileDTO(usuario);
    }

    /**
     * Atualiza as informações do perfil do usuário logado (por e-mail do token)
     */
    @Transactional
    public ProfileDTOResponse updateProfileByEmail(String email, UpdateProfileDTORequest dto) {
        Usuario usuario = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Usuário não encontrado com e-mail: " + email));
        return updateProfileInternal(usuario, dto);
    }

    /**
     * Atualiza as informações do perfil por ID
     */
    @Transactional
    public ProfileDTOResponse updateProfileById(int idUsuario, UpdateProfileDTORequest dto) {
        Usuario usuario = userRepository.findById(idUsuario)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Usuário não encontrado com ID: " + idUsuario));
        return updateProfileInternal(usuario, dto);
    }

    private ProfileDTOResponse updateProfileInternal(Usuario usuario, UpdateProfileDTORequest dto) {
        if (dto.name != null && !dto.name.trim().isEmpty()) {
            usuario.setNome(dto.name.trim());
        }
        if (dto.avatarUrl != null) {
            usuario.setFoto(dto.avatarUrl);
        }
        if (dto.description != null) {
            usuario.setDescricao(dto.description);
        }
        if (dto.publicStreak != null) {
            usuario.setStreakPublico(dto.publicStreak);
        }
        if (dto.publicCurrentGoals != null) {
            usuario.setMetasPublicas(dto.publicCurrentGoals);
        }

        // Frequência de streak
        if (dto.streakFrequencyCount != null && dto.streakFrequencyCount > 0) {
            String period = dto.streakFrequencyPeriod != null ? dto.streakFrequencyPeriod.toLowerCase() : "week";
            usuario.setFrequenciaNum(dto.streakFrequencyCount);
            usuario.setFrequenciaPeriodo(period);

            Duration intervalo;
            if ("day".equals(period)) {
                long seconds = (long)(86400.0 / dto.streakFrequencyCount);
                intervalo = Duration.ofSeconds(Math.max(60, seconds));
            } else if ("month".equals(period)) {
                long seconds = (long)((30.0 * 86400.0) / dto.streakFrequencyCount);
                intervalo = Duration.ofSeconds(Math.max(86400, seconds));
            } else {
                long seconds = (long)((7.0 * 86400.0) / dto.streakFrequencyCount);
                intervalo = Duration.ofSeconds(Math.max(3600, seconds));
            }
            usuario.setIntervaloAtividade(intervalo);
        }

        userRepository.save(usuario);

        // Atualizar Tags
        if (dto.tags != null) {
            tagUsuarioRepository.deleteByIdUsuario(usuario.getId());
            for (String tagNome : dto.tags) {
                String nomeLimpo = tagNome.trim();
                if (nomeLimpo.isEmpty()) continue;
                Tag tag = tagRepository.findByDescricao(nomeLimpo)
                        .orElseGet(() -> tagRepository.save(new Tag(0, nomeLimpo)));
                tagUsuarioRepository.save(new TagUsuario(tag.getId(), usuario.getId()));
            }
        }

        // Atualizar visibilidade das metas concluídas no perfil (estante de troféus, máx 5)
        if (dto.visibleAchievementIds != null) {
            List<Integer> allowedIds = dto.visibleAchievementIds.stream()
                    .limit(5)
                    .collect(Collectors.toList());
            List<Meta> todasDoUsuario = goalRepository.findByUsuarioId(usuario.getId());
            for (Meta meta : todasDoUsuario) {
                boolean visivel = allowedIds.contains(meta.getId());
                meta.setVisivel(visivel);
                goalRepository.save(meta);
            }
        }

        return buildProfileDTO(usuario);
    }

    /**
     * Retorna todas as tags cadastradas no banco de dados para a seleção no Editar Perfil
     */
    public List<String> getAllTags() {
        return tagRepository.findAll().stream()
                .map(Tag::getDescricao)
                .distinct()
                .collect(Collectors.toList());
    }

    /**
     * Monta o DTO de perfil exatamente no formato esperado pelo React Native
     */
    private ProfileDTOResponse buildProfileDTO(Usuario usuario) {
        ProfileDTOResponse dto = new ProfileDTOResponse();
        dto.id = usuario.getId();
        dto.name = usuario.getNome();
        dto.handle = "@" + usuario.getNome();
        dto.avatarUrl = usuario.getFoto() != null ? usuario.getFoto() : "";
        dto.description = usuario.getDescricao() != null ? usuario.getDescricao() : "";
        dto.streakCount = usuario.getStreakNum();
        dto.publicStreak = usuario.isStreakPublico();
        dto.publicCurrentGoals = usuario.isMetasPublicas();

        // Calcular periodicidade de check-in / streak
        if (usuario.getFrequenciaNum() != null && usuario.getFrequenciaPeriodo() != null) {
            dto.streakFrequencyCount = usuario.getFrequenciaNum();
            dto.streakFrequencyPeriod = usuario.getFrequenciaPeriodo();
        } else if (usuario.getIntervaloAtividade() != null) {
            long seconds = usuario.getIntervaloAtividade().getSeconds();
            if (seconds < 86400) {
                dto.streakFrequencyPeriod = "day";
                dto.streakFrequencyCount = Math.max(1, (int) Math.round(86400.0 / Math.max(1, seconds)));
            } else {
                long days = seconds / 86400;
                if (days >= 15) {
                    dto.streakFrequencyPeriod = "month";
                    dto.streakFrequencyCount = Math.max(1, (int) Math.round(30.0 / days));
                } else {
                    dto.streakFrequencyPeriod = "week";
                    dto.streakFrequencyCount = Math.max(1, (int) Math.round(7.0 / Math.max(1.0, (double)seconds / 86400.0)));
                }
            }
        } else {
            dto.streakFrequencyCount = 2;
            dto.streakFrequencyPeriod = "week";
        }

        // Buscar tags do usuário
        List<TagUsuario> tagUsuarios = tagUsuarioRepository.findByIdUsuario(usuario.getId());
        dto.tags = tagUsuarios.stream()
                .filter(tu -> tu.getTag() != null)
                .map(tu -> tu.getTag().getDescricao())
                .collect(Collectors.toList());

        // Buscar submetas indexadas por idMeta
        Map<Integer, List<SubMeta>> subMetasPorMeta = goalRepository
                .findAllSubMetasByUsuario(usuario.getId())
                .stream()
                .collect(Collectors.groupingBy(SubMeta::getIdMeta));

        // Buscar TODAS as metas do usuário (distinguindo Goal vs Achievement)
        List<Meta> todasMetas = goalRepository.findByUsuarioId(usuario.getId());
        for (Meta meta : todasMetas) {
            List<SubMeta> subs = subMetasPorMeta.getOrDefault(meta.getId(), List.of());
            boolean allSubsConcluidas = !subs.isEmpty() && subs.stream().allMatch(SubMeta::isConcluido);
            boolean isConcluida = meta.isConcluido() || allSubsConcluidas;

            if (isConcluida) {
                // Achievement (Conquista finalizada)
                long daysJourney = 90; // fallback de 3 meses
                if (meta.getDtInicio() != null) {
                    LocalDateTime fim = meta.getDtFim() != null ? meta.getDtFim() : LocalDateTime.now();
                    daysJourney = Math.max(1, ChronoUnit.DAYS.between(meta.getDtInicio(), fim));
                }
                long monthsJourney = daysJourney / 30;
                String journeyText = monthsJourney > 0 ? monthsJourney + " Month journey" : daysJourney + " Days journey";

                String mediaType = (meta.getId() % 2 == 0) ? "image" : "video";

                ProfileAchievementDTO achDto = new ProfileAchievementDTO(
                        meta.getId(),
                        meta.getTitulo(),
                        journeyText,
                        subs.size(),
                        mediaType
                );

                // Todas as conquistas finalizadas (para seleção no Editar Perfil)
                dto.allCompletedAchievements.add(achDto);

                // Apenas as selecionadas como visíveis entram na estante (máx 5)
                if (meta.isVisivel() && dto.achievements.size() < 5) {
                    dto.visibleAchievementIds.add(meta.getId());
                    dto.achievements.add(achDto);
                }
            } else {
                // Goal (Objetivo em andamento)
                ProfileCurrentGoalDTO currentGoal = new ProfileCurrentGoalDTO(meta.getId(), meta.getTitulo());
                for (SubMeta sub : subs) {
                    long subDays = 30;
                    if (sub.getDtInicio() != null && sub.getDtFim() != null) {
                        subDays = Math.max(1, ChronoUnit.DAYS.between(sub.getDtInicio(), sub.getDtFim()));
                    }
                    long subMonths = subDays / 30;
                    String label = subMonths > 0 ? subMonths + " Months" : subDays + " days";

                    currentGoal.nodes.add(new ProfileTimelineNodeDTO(
                            sub.getId(),
                            label,
                            sub.isConcluido()
                    ));
                }
                dto.currentGoals.add(currentGoal);
            }
        }

        return dto;
    }

    public Usuario createUsuario(Usuario user) {
        return userRepository.save(user);
    }

    public Usuario updateUsuario(Usuario user) {
        return userRepository.save(user);
    }

    public boolean deleteUsuario(int id) {
        userRepository.deleteById(id);
        return true;
    }

    // Método de autenticação
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .map(UserAuthenticated::new)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado com o e-mail: " + email));
    }
}
