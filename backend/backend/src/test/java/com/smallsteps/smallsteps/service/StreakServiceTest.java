package com.smallsteps.smallsteps.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.smallsteps.smallsteps.entity.Participam;
import com.smallsteps.smallsteps.entity.ParticipamId;
import com.smallsteps.smallsteps.entity.Usuario;
import com.smallsteps.smallsteps.repository.ParticipamRepository;
import com.smallsteps.smallsteps.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class StreakServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ParticipamRepository participamRepository;

    private StreakService streakService;

    @BeforeEach
    void setUp() {
        streakService = new StreakService(userRepository, participamRepository);
    }

    @Test
    void pendentePostIncrementaStreakEViraAtivoComMensagem() {
        LocalDateTime agora = LocalDateTime.of(2026, 11, 25, 12, 0, 0);
        Usuario usuario = new Usuario();
        usuario.setId(1);
        usuario.setStreakNum(5);
        usuario.setIntervaloAtividade(Duration.ofDays(1));
        usuario.setUltimaAtividade(agora.minusHours(20));
        usuario.setUltimoPrazo(agora.plusHours(12)); // inicio_ciclo = agora - 12h > ultima_atividade (-20h)

        Participam participam = new Participam();
        participam.setIdUsuario(1);
        participam.setIdComunidade(10);
        participam.setPontos(3);
        when(participamRepository.findById(any(ParticipamId.class))).thenReturn(Optional.of(participam));
        when(userRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        assertEquals(StreakService.EstadoStreak.PENDENTE, StreakService.calcularEstado(usuario, agora));

        StreakService.StreakUpdateResult result = streakService.registrarAtividadePorPost(usuario, 10, agora);

        assertEquals("INCREMENTED", result.getAction());
        assertEquals(6, usuario.getStreakNum());
        assertEquals(StreakService.EstadoStreak.ATIVO, StreakService.calcularEstado(usuario, agora));
        assertEquals(
                "Bom trabalho! A sua sequência aumentou para 6. Volte no dia 26/11/2026. Continue assim!",
                result.getMessage());
        assertEquals(4, participam.getPontos());
    }

    @Test
    void ativoPostNaoIncrementaStreakENaoRetornaMensagem() {
        LocalDateTime agora = LocalDateTime.of(2026, 11, 25, 12, 0, 0);
        Usuario usuario = new Usuario();
        usuario.setId(2);
        usuario.setStreakNum(10);
        usuario.setIntervaloAtividade(Duration.ofDays(1));
        usuario.setUltimaAtividade(agora.minusHours(2));
        usuario.setUltimoPrazo(agora.plusHours(12)); // inicio_ciclo = agora - 12h < ultima_atividade (-2h)

        when(participamRepository.findById(any(ParticipamId.class))).thenReturn(Optional.empty());
        when(userRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        assertEquals(StreakService.EstadoStreak.ATIVO, StreakService.calcularEstado(usuario, agora));

        StreakService.StreakUpdateResult result = streakService.registrarAtividadePorPost(usuario, 10, agora);

        assertEquals("NONE", result.getAction());
        assertEquals(10, usuario.getStreakNum());
        assertNull(result.getMessage());
        assertEquals(StreakService.EstadoStreak.ATIVO, StreakService.calcularEstado(usuario, agora));
    }

    @Test
    void congeladoPostNaoIncrementaRedefineCicloEVoltaParaPendenteComMensagem() {
        LocalDateTime agora = LocalDateTime.of(2026, 11, 25, 12, 0, 0);
        Usuario usuario = new Usuario();
        usuario.setId(4);
        usuario.setStreakNum(3);
        usuario.setIntervaloAtividade(Duration.ofDays(2));
        usuario.setUltimaAtividade(agora.minusDays(10));
        usuario.setUltimoPrazo(agora.minusDays(5));

        when(userRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        assertEquals(StreakService.EstadoStreak.CONGELADO, StreakService.calcularEstado(usuario, agora));

        StreakService.StreakUpdateResult result = streakService.registrarAtividadePorPost(usuario, 10, agora);

        assertEquals("UNFROZEN", result.getAction());
        assertEquals(3, usuario.getStreakNum());
        assertEquals(agora, usuario.getUltimaAtividade());
        assertEquals(agora.plusDays(2), usuario.getUltimoPrazo());
        assertTrue(usuario.isCicloDescongelamento());
        assertEquals(StreakService.EstadoStreak.PENDENTE, StreakService.calcularEstado(usuario, agora));
        assertEquals(
                "Você postou depois do prazo, então a sequência não contará dessa vez. Volte no dia 27/11/2026 para retomar!",
                result.getMessage());
        verify(participamRepository, never()).save(any());

        // Bug 2: segundo post imediato durante o ciclo de descongelamento NÃO deve contabilizar
        LocalDateTime dezMinutosDepois = agora.plusMinutes(10);
        StreakService.StreakUpdateResult segundoPost =
                streakService.registrarAtividadePorPost(usuario, 10, dezMinutosDepois);

        assertEquals("UNFREEZE_WAIT", segundoPost.getAction());
        assertEquals(3, usuario.getStreakNum());
        assertTrue(usuario.isCicloDescongelamento());
        assertEquals(StreakService.EstadoStreak.PENDENTE, StreakService.calcularEstado(usuario, dezMinutosDepois));
        assertEquals(
                "Sua sequência está em descongelamento e ainda não conta neste ciclo. Volte no dia 27/11/2026 para retomar!",
                segundoPost.getMessage());

        // Após a data de reset (27/11/2026), o usuário pode voltar a contabilizar +1
        LocalDateTime noProximoCiclo = agora.plusDays(2).plusHours(2);
        when(participamRepository.findById(any(ParticipamId.class))).thenReturn(Optional.empty());
        assertEquals(StreakService.EstadoStreak.PENDENTE, StreakService.calcularEstado(usuario, noProximoCiclo));

        StreakService.StreakUpdateResult retomada =
                streakService.registrarAtividadePorPost(usuario, 10, noProximoCiclo);

        assertEquals("INCREMENTED", retomada.getAction());
        assertEquals(4, usuario.getStreakNum());
        assertFalse(usuario.isCicloDescongelamento());
        assertEquals(agora.plusDays(4), usuario.getUltimoPrazo());
        assertEquals(StreakService.EstadoStreak.ATIVO, StreakService.calcularEstado(usuario, noProximoCiclo));
        assertEquals(
                "Bom trabalho! A sua sequência aumentou para 4. Volte no dia 29/11/2026. Continue assim!",
                retomada.getMessage());
    }

    @Test
    void alterarIntervaloNoMeioDoCicloAtivoMantemCicloAtualEAplicaSomenteNoProximo() {
        LocalDateTime agora = LocalDateTime.of(2026, 11, 25, 12, 0, 0);
        Usuario usuario = new Usuario();
        usuario.setId(3);
        usuario.setStreakNum(30);
        usuario.setIntervaloAtividade(Duration.ofDays(7));
        usuario.setUltimaAtividade(agora.minusDays(1));
        usuario.setUltimoPrazo(agora.plusDays(5));
        // Usuário reduziu o intervalo para 1 dia no meio do ciclo ativo de 7 dias
        usuario.setProximoIntervalo(Duration.ofDays(1));

        when(participamRepository.findById(any(ParticipamId.class))).thenReturn(Optional.empty());
        when(userRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        // Bug 1: deve continuar ATIVO até o fim do ciclo de 7 dias
        assertEquals(StreakService.EstadoStreak.ATIVO, StreakService.calcularEstado(usuario, agora));

        // Após o fim do ciclo de 7 dias (+2h), entra no novo ciclo com duração de 1 dia -> PENDENTE
        LocalDateTime inicioNovoCiclo = agora.plusDays(5).plusHours(2);
        assertEquals(StreakService.EstadoStreak.PENDENTE, StreakService.calcularEstado(usuario, inicioNovoCiclo));

        StreakService.StreakUpdateResult result =
                streakService.registrarAtividadePorPost(usuario, 10, inicioNovoCiclo);

        assertEquals("INCREMENTED", result.getAction());
        assertEquals(31, usuario.getStreakNum());
        assertEquals(Duration.ofDays(1), usuario.getIntervaloAtividade());
        assertNull(usuario.getProximoIntervalo());
        assertEquals(agora.plusDays(6), usuario.getUltimoPrazo());
        assertEquals(StreakService.EstadoStreak.ATIVO, StreakService.calcularEstado(usuario, inicioNovoCiclo));
        assertEquals(
                "Bom trabalho! A sua sequência aumentou para 31. Volte no dia 01/12/2026. Continue assim!",
                result.getMessage());
    }

    @Test
    void viradaDeCicloAposAtivoPassaParaPendenteEAvancaUltimoPrazoAoPostar() {
        LocalDateTime prazoAnterior = LocalDateTime.of(2026, 11, 25, 10, 0, 0);
        LocalDateTime agora = LocalDateTime.of(2026, 11, 25, 15, 0, 0); // dentro de [prazoAnterior, prazoAnterior + 1d]

        Usuario usuario = new Usuario();
        usuario.setId(3);
        usuario.setStreakNum(7);
        usuario.setIntervaloAtividade(Duration.ofDays(1));
        usuario.setUltimaAtividade(prazoAnterior.minusHours(3)); // concluiu ciclo anterior
        usuario.setUltimoPrazo(prazoAnterior);

        when(participamRepository.findById(any(ParticipamId.class))).thenReturn(Optional.empty());
        when(userRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        assertEquals(StreakService.EstadoStreak.PENDENTE, StreakService.calcularEstado(usuario, agora));

        StreakService.StreakUpdateResult result = streakService.registrarAtividadePorPost(usuario, 10, agora);

        assertEquals("INCREMENTED", result.getAction());
        assertEquals(8, usuario.getStreakNum());
        assertEquals(prazoAnterior.plusDays(1), usuario.getUltimoPrazo());
        assertEquals(StreakService.EstadoStreak.ATIVO, StreakService.calcularEstado(usuario, agora));
        assertEquals(
                "Bom trabalho! A sua sequência aumentou para 8. Volte no dia 26/11/2026. Continue assim!",
                result.getMessage());
    }

    @Test
    void primeiroPostComUltimoPrazoNullCriaPrimeiroCicloEViraAtivo() {
        LocalDateTime agora = LocalDateTime.of(2026, 11, 25, 12, 0, 0);
        Usuario usuario = new Usuario();
        usuario.setId(99);
        usuario.setStreakNum(0);
        usuario.setIntervaloAtividade(Duration.ofDays(3));
        usuario.setUltimoPrazo(null);
        usuario.setUltimaAtividade(null);

        when(participamRepository.findById(any(ParticipamId.class))).thenReturn(Optional.empty());
        when(userRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        assertEquals(StreakService.EstadoStreak.PENDENTE, StreakService.calcularEstado(usuario, agora));

        StreakService.StreakUpdateResult result = streakService.registrarAtividadePorPost(usuario, 10, agora);

        assertEquals("INCREMENTED", result.getAction());
        assertEquals(1, usuario.getStreakNum());
        assertEquals(agora.plusDays(3), usuario.getUltimoPrazo());
        assertEquals(StreakService.EstadoStreak.ATIVO, StreakService.calcularEstado(usuario, agora));
        assertEquals(
                "Bom trabalho! A sua sequência aumentou para 1. Volte no dia 28/11/2026. Continue assim!",
                result.getMessage());
    }
}
