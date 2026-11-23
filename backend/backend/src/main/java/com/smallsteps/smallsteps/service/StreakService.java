package com.smallsteps.smallsteps.service;

import java.time.Duration;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smallsteps.smallsteps.entity.Participam;
import com.smallsteps.smallsteps.entity.ParticipamId;
import com.smallsteps.smallsteps.entity.Usuario;
import com.smallsteps.smallsteps.repository.ParticipamRepository;
import com.smallsteps.smallsteps.repository.UserRepository;

@Service
public class StreakService {

    private final UserRepository userRepository;
    private final ParticipamRepository participamRepository;

    public StreakService(UserRepository userRepository, ParticipamRepository participamRepository) {
        this.userRepository = userRepository;
        this.participamRepository = participamRepository;
    }

    /**
     * Registra uma atividade (post em comunidade) para o usuário:
     * - Streak global: sobe no máximo +1 por ciclo (duração = intervaloAtividade).
     *   Se estiver congelado (perdeu 1+ ciclos completos), o post apenas descongela o ciclo
     *   sem somar streak nem pontos de comunidade.
     * - Pontos na comunidade: sobe no máximo +1 por ciclo por comunidade (não pontua em ciclo de descongelamento).
     */
    @Transactional
    public void registrarAtividadePorPost(Usuario usuario, int idComunidade) {
        if (usuario == null) {
            return;
        }

        LocalDateTime agora = LocalDateTime.now();
        Duration duracao = usuario.getIntervaloAtividade();
        if (duracao == null || duracao.isZero() || duracao.isNegative()) {
            duracao = Duration.ofDays(1);
            usuario.setIntervaloAtividade(duracao);
        }

        LocalDateTime prazoAtual = usuario.getUltimoPrazo();
        LocalDateTime ultimaAtividade = usuario.getUltimaAtividade();
        LocalDateTime inicioCiclo = usuario.getInicioCiclo();

        boolean podePontuarComunidade;

        if (prazoAtual == null) {
            // Primeiro post / primeiro ciclo do usuário
            inicioCiclo = agora;
            prazoAtual = agora.plus(duracao);
            usuario.setInicioCiclo(inicioCiclo);
            usuario.setUltimoPrazo(prazoAtual);
            usuario.setUltimaAtividade(agora);
            usuario.setStreakNum(usuario.getStreakNum() + 1);
            usuario.setCicloDescongelamento(false);
            podePontuarComunidade = true;
        } else {
            if (inicioCiclo == null) {
                inicioCiclo = prazoAtual.minus(duracao);
            }

            if (!agora.isAfter(prazoAtual)) {
                // Estamos dentro do ciclo atual [inicioCiclo, prazoAtual]
                boolean jaAtivoNesteCiclo = ultimaAtividade != null && !ultimaAtividade.isBefore(inicioCiclo);

                if (jaAtivoNesteCiclo) {
                    // Já completou a streak deste ciclo: não soma streak novamente,
                    // mas pode pontuar em outra comunidade se este não for um ciclo de descongelamento
                    podePontuarComunidade = !usuario.isCicloDescongelamento();
                } else {
                    // Estava pendente neste ciclo: pontua streak e ativa o ciclo
                    usuario.setInicioCiclo(inicioCiclo);
                    usuario.setUltimaAtividade(agora);
                    usuario.setStreakNum(usuario.getStreakNum() + 1);
                    usuario.setCicloDescongelamento(false);
                    podePontuarComunidade = true;
                }
            } else {
                // O prazoAtual já passou: verifica se o ciclo anterior foi concluído e se estamos no próximo ciclo imediato
                boolean cicloAnteriorConcluido = ultimaAtividade != null
                        && !ultimaAtividade.isBefore(inicioCiclo)
                        && !ultimaAtividade.isAfter(prazoAtual);

                LocalDateTime proximoPrazo = prazoAtual.plus(duracao);

                if (cicloAnteriorConcluido && !agora.isAfter(proximoPrazo)) {
                    // Novo ciclo imediato [prazoAtual, proximoPrazo] — usuário estava PENDENTE e cumpriu a tempo
                    inicioCiclo = prazoAtual;
                    prazoAtual = proximoPrazo;
                    usuario.setInicioCiclo(inicioCiclo);
                    usuario.setUltimoPrazo(prazoAtual);
                    usuario.setUltimaAtividade(agora);
                    usuario.setStreakNum(usuario.getStreakNum() + 1);
                    usuario.setCicloDescongelamento(false);
                    podePontuarComunidade = true;
                } else {
                    // Usuário estava CONGELADO: descongela sem somar streak e sem pontuar na comunidade
                    inicioCiclo = agora;
                    prazoAtual = agora.plus(duracao);
                    usuario.setInicioCiclo(inicioCiclo);
                    usuario.setUltimoPrazo(prazoAtual);
                    usuario.setUltimaAtividade(agora);
                    usuario.setCicloDescongelamento(true);
                    podePontuarComunidade = false;
                }
            }
        }

        userRepository.save(usuario);

        if (podePontuarComunidade) {
            ParticipamId participamId = new ParticipamId(usuario.getId(), idComunidade);
            Participam participam = participamRepository.findById(participamId).orElse(null);
            if (participam != null) {
                LocalDateTime ultimaPontuacao = participam.getUltimaPontuacao();
                boolean jaPontuouNestaComunidade = ultimaPontuacao != null
                        && !ultimaPontuacao.isBefore(inicioCiclo);

                if (!jaPontuouNestaComunidade) {
                    participam.setPontos(participam.getPontos() + 1);
                    participam.setUltimaPontuacao(agora);
                    participamRepository.save(participam);
                }
            }
        }
    }
}
