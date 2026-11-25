package com.smallsteps.smallsteps.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.smallsteps.smallsteps.dto.ProfileDTOResponse;
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

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private GoalRepository goalRepository;

    @Mock
    private TagRepository tagRepository;

    @Mock
    private TagUsuarioRepository tagUsuarioRepository;

    @InjectMocks
    private UserService userService;

    private Usuario usuarioTeste;

    @BeforeEach
    void setUp() {
        usuarioTeste = new Usuario();
        usuarioTeste.setId(1);
        usuarioTeste.setNome("Lagarto Voador");
        usuarioTeste.setEmail("lagarto@email.com");
        usuarioTeste.setDescricao("Praticando piano por diversao!");
        usuarioTeste.setStreakNum(127);
        usuarioTeste.setIntervaloAtividade(Duration.ofDays(3)); // 2 times a week
        usuarioTeste.setFoto("https://example.com/avatar.png");
        usuarioTeste.setStreakPublico(false);
        usuarioTeste.setMetasPublicas(true);
    }

    @Test
    @DisplayName("Deve buscar perfil completo por email com sucesso")
    void deveBuscarPerfilPorEmail() {
        when(userRepository.findByEmail("lagarto@email.com")).thenReturn(Optional.of(usuarioTeste));

        // Mock tags
        Tag tagPiano = new Tag(1, "Piano");
        TagUsuario tu = new TagUsuario(1, 1);
        tu.setTag(tagPiano);
        when(tagUsuarioRepository.findByIdUsuario(1)).thenReturn(List.of(tu));

        // Mock metas (Goal vs Achievement)
        Meta metaConcluida = new Meta();
        metaConcluida.setId(10);
        metaConcluida.setTitulo("Canon in D");
        metaConcluida.setConcluido(true);
        metaConcluida.setVisivel(true);
        metaConcluida.setDtInicio(LocalDateTime.now().minusDays(90));
        metaConcluida.setDtFim(LocalDateTime.now());

        Meta metaEmAndamento = new Meta();
        metaEmAndamento.setId(20);
        metaEmAndamento.setTitulo("Die Mittsommernacht-Fantasie");
        metaEmAndamento.setConcluido(false);
        metaEmAndamento.setVisivel(true);

        when(goalRepository.findByUsuarioId(1)).thenReturn(List.of(metaConcluida, metaEmAndamento));

        // Mock submetas
        SubMeta subMeta = new SubMeta();
        subMeta.setId(100);
        subMeta.setMeta(metaEmAndamento);
        subMeta.setTitulo("Parte 1");
        subMeta.setConcluido(false); // Em andamento
        subMeta.setDtInicio(LocalDateTime.now().minusDays(30));
        subMeta.setDtFim(LocalDateTime.now());
        when(goalRepository.findAllSubMetasByUsuario(1)).thenReturn(List.of(subMeta));

        // Execução
        ProfileDTOResponse profile = userService.getProfileByEmail("lagarto@email.com");

        // Asserts
        assertNotNull(profile);
        assertEquals(1, profile.id);
        assertEquals("Lagarto Voador", profile.name);
        assertEquals("@Lagarto Voador", profile.handle);
        assertEquals("Praticando piano por diversao!", profile.description);
        assertEquals(127, profile.streakCount);
        assertFalse(profile.publicStreak);
        assertTrue(profile.publicCurrentGoals);

        // Tags
        assertEquals(1, profile.tags.size());
        assertEquals("Piano", profile.tags.get(0));

        // Achievements
        assertEquals(1, profile.achievements.size());
        assertEquals("Canon in D", profile.achievements.get(0).title);
        assertEquals(1, profile.visibleAchievementIds.size());
        assertEquals(10, profile.visibleAchievementIds.get(0));

        // Current Goals
        assertEquals(1, profile.currentGoals.size());
        assertEquals("Die Mittsommernacht-Fantasie", profile.currentGoals.get(0).title);
        assertEquals(1, profile.currentGoals.get(0).nodes.size());
        assertFalse(profile.currentGoals.get(0).nodes.get(0).completed);
        assertEquals(1, profile.allCompletedAchievements.size());
    }

    @Test
    @DisplayName("Deve atualizar perfil com novos dados, tags e visibilidade de metas")
    void deveAtualizarPerfil() {
        when(userRepository.findByEmail("lagarto@email.com")).thenReturn(Optional.of(usuarioTeste));
        when(userRepository.save(any(Usuario.class))).thenReturn(usuarioTeste);

        // Tags mock
        Tag tagJazz = new Tag(2, "Jazz");
        when(tagRepository.findByDescricao("Jazz")).thenReturn(Optional.of(tagJazz));

        // Metas para atualização de visibilidade
        Meta metaConcluida = new Meta();
        metaConcluida.setId(10);
        metaConcluida.setConcluido(true);
        metaConcluida.setVisivel(false);
        when(goalRepository.findByUsuarioId(1)).thenReturn(List.of(metaConcluida));

        UpdateProfileDTORequest request = new UpdateProfileDTORequest();
        request.name = "Lagarto Novo Nome";
        request.description = "Nova descricao de piano!";
        request.avatarUrl = "https://example.com/new.png";
        request.tags = List.of("Jazz");
        request.streakFrequencyCount = 3;
        request.streakFrequencyPeriod = "week";
        request.publicStreak = true;
        request.publicCurrentGoals = false;
        request.visibleAchievementIds = List.of(10);

        ProfileDTOResponse updated = userService.updateProfileByEmail("lagarto@email.com", request);

        // Verificações
        verify(userRepository).save(usuarioTeste);
        assertEquals("Lagarto Novo Nome", usuarioTeste.getNome());
        assertEquals("Nova descricao de piano!", usuarioTeste.getDescricao());
        assertEquals("https://example.com/new.png", usuarioTeste.getFoto());
        assertTrue(usuarioTeste.isStreakPublico());
        assertFalse(usuarioTeste.isMetasPublicas());

        // Verifica deleção e recriação de tags
        verify(tagUsuarioRepository).deleteByIdUsuario(1);
        verify(tagUsuarioRepository).save(any(TagUsuario.class));

        // Verifica salvamento da visibilidade da meta
        verify(goalRepository).save(metaConcluida);
        assertTrue(metaConcluida.isVisivel());
        assertEquals(Duration.ofDays(21), usuarioTeste.getIntervaloAtividade());
        assertNotNull(usuarioTeste.getUltimoPrazo());
    }

    @Test
    @DisplayName("Deve preservar ultimo_prazo atual ao alterar intervalo_atividade no meio de um ciclo")
    void devePreservarUltimoPrazoAoAlterarIntervaloNoMeioDoCiclo() {
        LocalDateTime prazoOriginal = LocalDateTime.of(2026, 11, 30, 18, 0, 0);
        usuarioTeste.setUltimoPrazo(prazoOriginal);

        when(userRepository.findByEmail("lagarto@email.com")).thenReturn(Optional.of(usuarioTeste));
        when(userRepository.save(any(Usuario.class))).thenReturn(usuarioTeste);

        UpdateProfileDTORequest request = new UpdateProfileDTORequest();
        request.streakFrequencyCount = 7;
        request.streakFrequencyPeriod = "day";

        ProfileDTOResponse response = userService.updateProfileByEmail("lagarto@email.com", request);

        assertEquals(Duration.ofDays(3), usuarioTeste.getIntervaloAtividade());
        assertEquals(Duration.ofDays(7), usuarioTeste.getProximoIntervalo());
        assertEquals(prazoOriginal, usuarioTeste.getUltimoPrazo());
        assertEquals(1, response.streakFrequencyCount);
        assertEquals("week", response.streakFrequencyPeriod);
    }

    @Test
    @DisplayName("Deve retornar todas as tags disponíveis")
    void deveRetornarTodasAsTags() {
        when(tagRepository.findAllByOrderByDescricaoAsc()).thenReturn(List.of(
                new Tag(1, "Piano"),
                new Tag(2, "Jazz"),
                new Tag(3, "Iniciante")
        ));

        List<String> tags = userService.getAllTags();

        assertEquals(3, tags.size());
        assertTrue(tags.contains("Piano"));
        assertTrue(tags.contains("Jazz"));
        assertTrue(tags.contains("Iniciante"));
    }
}
