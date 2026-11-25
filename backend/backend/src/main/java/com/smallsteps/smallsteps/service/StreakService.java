package com.smallsteps.smallsteps.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smallsteps.smallsteps.entity.Participam;
import com.smallsteps.smallsteps.entity.ParticipamId;
import com.smallsteps.smallsteps.entity.Usuario;
import com.smallsteps.smallsteps.repository.ParticipamRepository;
import com.smallsteps.smallsteps.repository.UserRepository;

@Service
public class StreakService {

    public enum EstadoStreak {
        ATIVO,
        PENDENTE,
        CONGELADO
    }

    public static class StreakUpdateResult {
        private final String action; // "INCREMENTED", "UNFROZEN", "UNFREEZE_WAIT", "NONE"
        private final int streakNum;
        private final EstadoStreak status;
        private final LocalDateTime proximoReset;
        private final String message;

        public StreakUpdateResult(
                String action,
                int streakNum,
                EstadoStreak status,
                LocalDateTime proximoReset,
                String message) {
            this.action = action;
            this.streakNum = streakNum;
            this.status = status;
            this.proximoReset = proximoReset;
            this.message = message;
        }

        public String getAction() {
            return action;
        }

        public int getStreakNum() {
            return streakNum;
        }

        public EstadoStreak getStatus() {
            return status;
        }

        public LocalDateTime getProximoReset() {
            return proximoReset;
        }

        public String getMessage() {
            return message;
        }
    }

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final UserRepository userRepository;
    private final ParticipamRepository participamRepository;

    public StreakService(UserRepository userRepository, ParticipamRepository participamRepository) {
        this.userRepository = userRepository;
        this.participamRepository = participamRepository;
    }

    private static Duration obterDuracaoValida(Duration duracao) {
        if (duracao == null || duracao.isZero() || duracao.isNegative()) {
            return null;
        }
        return duracao;
    }

    /**
     * Calcula o estado atual da sequência considerando:
     * - intervalo_atividade (duração do ciclo em andamento)
     * - proximo_intervalo (nova duração agendada para vigorar após o fim do ciclo atual)
     * - ultimo_prazo (fim do ciclo atual; início do ciclo = ultimo_prazo - intervalo_atividade)
     * - ultima_atividade (momento do último post contabilizado/descongelamento)
     * - ciclo_descongelamento (indica que o ciclo atual é de carência após descongelar)
     *
     * Regras:
     * - ATIVO (Verde):     agora <= ultimo_prazo && !ciclo_descongelamento && inicio_ciclo < ultima_atividade <= ultimo_prazo
     * - PENDENTE (Laranja):
     *     (a) ultimo_prazo == null (primeiro ciclo)
     *     (b) agora <= ultimo_prazo && (ciclo_descongelamento || ultima_atividade == null || ultima_atividade <= inicio_ciclo)
     *     (c) agora > ultimo_prazo && ciclo anterior concluído/descongelado && agora <= ultimo_prazo + duracaoProximoCiclo
     * - CONGELADO (Cinza): agora > ultimo_prazo e o usuário não cumpriu o prazo do ciclo
     */
    public static EstadoStreak calcularEstado(Usuario usuario) {
        return calcularEstado(usuario, LocalDateTime.now());
    }

    public static EstadoStreak calcularEstado(Usuario usuario, LocalDateTime agora) {
        if (usuario == null) {
            return EstadoStreak.PENDENTE;
        }
        Duration duracaoAtual = obterDuracaoValida(usuario.getIntervaloAtividade());
        LocalDateTime prazo = usuario.getUltimoPrazo();
        LocalDateTime ultimaAtividade = usuario.getUltimaAtividade();
        boolean emDescongelamento = usuario.isCicloDescongelamento();

        if (prazo == null || duracaoAtual == null) {
            return EstadoStreak.PENDENTE;
        }

        LocalDateTime inicioCiclo = prazo.minus(duracaoAtual);
        boolean cicloAtualConcluido = !emDescongelamento
                && ultimaAtividade != null
                && ultimaAtividade.isAfter(inicioCiclo)
                && !ultimaAtividade.isAfter(prazo);

        if (!agora.isAfter(prazo)) {
            return cicloAtualConcluido ? EstadoStreak.ATIVO : EstadoStreak.PENDENTE;
        }

        // O ultimo_prazo já passou: se o ciclo anterior foi concluído (ou era um ciclo de descongelamento)
        // e estamos dentro do ciclo seguinte [prazo, prazo + duracaoProximo], o estado é PENDENTE no novo ciclo.
        Duration duracaoProximo = obterDuracaoValida(usuario.getProximoIntervalo());
        if (duracaoProximo == null) {
            duracaoProximo = duracaoAtual;
        }
        LocalDateTime proximoPrazo = prazo.plus(duracaoProximo);
        boolean cicloAnteriorValido = emDescongelamento || cicloAtualConcluido;

        if (cicloAnteriorValido && !agora.isAfter(proximoPrazo)) {
            return EstadoStreak.PENDENTE;
        }

        // Passou do prazo sem cumprir a atividade -> CONGELADO
        return EstadoStreak.CONGELADO;
    }

    /**
     * Registra uma atividade (post em comunidade) para o usuário:
     * - Se PENDENTE em ciclo de descongelamento (agora <= ultimo_prazo && ciclo_descongelamento):
     *   bloqueia o incremento até a data de reset (ultimo_prazo) e informa o usuário.
     * - Se PENDENTE elegível: aumenta streak_num em +1, marca ultima_atividade (estado vira ATIVO),
     *   aplica proximo_intervalo e avança ultimo_prazo se entrou em um novo ciclo, e retorna aviso de parabéns.
     * - Se ATIVO: já bateu o ponto neste ciclo — não aumenta streak_num e não exibe aviso.
     * - Se CONGELADO: não contabiliza streak_num, aplica proximo_intervalo se houver, redefine
     *   ultimo_prazo = agora + intervalo_atividade com ciclo_descongelamento = true (estado vira PENDENTE
     *   até o próximo ciclo) e retorna aviso de descongelamento.
     */
    @Transactional
    public StreakUpdateResult registrarAtividadePorPost(Usuario usuario, int idComunidade) {
        return registrarAtividadePorPost(usuario, idComunidade, LocalDateTime.now());
    }

    @Transactional
    public StreakUpdateResult registrarAtividadePorPost(Usuario usuario, int idComunidade, LocalDateTime agora) {
        if (usuario == null) {
            return new StreakUpdateResult("NONE", 0, EstadoStreak.PENDENTE, null, null);
        }

        Duration duracaoAtual = obterDuracaoValida(usuario.getIntervaloAtividade());
        if (duracaoAtual == null) {
            Duration proximo = obterDuracaoValida(usuario.getProximoIntervalo());
            duracaoAtual = proximo != null ? proximo : Duration.ofDays(1);
            usuario.setIntervaloAtividade(duracaoAtual);
            usuario.setProximoIntervalo(null);
        }

        LocalDateTime prazoAtual = usuario.getUltimoPrazo();
        EstadoStreak estadoAtual = calcularEstado(usuario, agora);

        LocalDateTime inicioCicloParaPontos;
        boolean podePontuarComunidade;
        StreakUpdateResult result;

        if (prazoAtual == null) {
            // Primeiro ciclo do usuário: ultimo_prazo = agora + intervalo_atividade
            // Somamos +1ms em ultima_atividade para garantir estritamente inicio_ciclo < ultima_atividade <= ultimo_prazo -> ATIVO
            Duration proximo = obterDuracaoValida(usuario.getProximoIntervalo());
            if (proximo != null) {
                duracaoAtual = proximo;
                usuario.setIntervaloAtividade(duracaoAtual);
                usuario.setProximoIntervalo(null);
            }
            LocalDateTime novoPrazo = agora.plus(duracaoAtual);
            usuario.setUltimoPrazo(novoPrazo);
            usuario.setUltimaAtividade(agora.plusNanos(1_000_000));
            usuario.setCicloDescongelamento(false);
            usuario.setStreakNum(usuario.getStreakNum() + 1);

            inicioCicloParaPontos = novoPrazo.minus(duracaoAtual);
            podePontuarComunidade = true;

            String msg = montarMensagemAumento(usuario.getStreakNum(), novoPrazo);
            result = new StreakUpdateResult("INCREMENTED", usuario.getStreakNum(), EstadoStreak.ATIVO, novoPrazo, msg);
        } else if (usuario.isCicloDescongelamento() && !agora.isAfter(prazoAtual)) {
            // Usuário ainda está dentro do ciclo de descongelamento: não contabiliza streak até o reset
            inicioCicloParaPontos = prazoAtual.minus(duracaoAtual);
            podePontuarComunidade = false;

            String msg = montarMensagemAguardandoRetomada(prazoAtual);
            result = new StreakUpdateResult("UNFREEZE_WAIT", usuario.getStreakNum(), EstadoStreak.PENDENTE, prazoAtual, msg);
        } else if (estadoAtual == EstadoStreak.ATIVO) {
            // Já bateu o ponto neste ciclo: não contabiliza streak novamente
            inicioCicloParaPontos = prazoAtual.minus(duracaoAtual);
            podePontuarComunidade = true;
            result = new StreakUpdateResult("NONE", usuario.getStreakNum(), EstadoStreak.ATIVO, prazoAtual, null);
        } else if (estadoAtual == EstadoStreak.PENDENTE) {
            // Pendente no ciclo atual ou recém-virado para o próximo ciclo imediato
            Duration duracaoEfetiva = duracaoAtual;
            LocalDateTime prazoEfetivo = prazoAtual;

            if (agora.isAfter(prazoAtual)) {
                Duration proximo = obterDuracaoValida(usuario.getProximoIntervalo());
                if (proximo != null) {
                    duracaoEfetiva = proximo;
                    usuario.setIntervaloAtividade(duracaoEfetiva);
                    usuario.setProximoIntervalo(null);
                }
                prazoEfetivo = prazoAtual.plus(duracaoEfetiva);
            }

            LocalDateTime inicioEfetivo = prazoEfetivo.minus(duracaoEfetiva);

            // Garante estritamente inicio_ciclo < ultima_atividade <= ultimo_prazo
            LocalDateTime atividadeRegistrada = agora.isAfter(inicioEfetivo)
                    ? agora
                    : inicioEfetivo.plusNanos(1_000_000);

            usuario.setUltimoPrazo(prazoEfetivo);
            usuario.setUltimaAtividade(atividadeRegistrada);
            usuario.setCicloDescongelamento(false);
            usuario.setStreakNum(usuario.getStreakNum() + 1);

            inicioCicloParaPontos = inicioEfetivo;
            podePontuarComunidade = true;

            String msg = montarMensagemAumento(usuario.getStreakNum(), prazoEfetivo);
            result = new StreakUpdateResult("INCREMENTED", usuario.getStreakNum(), EstadoStreak.ATIVO, prazoEfetivo, msg);
        } else {
            // Estado CONGELADO: não contabiliza streak nem pontos na comunidade.
            // Se o usuário agendou um novo intervalo, aplica agora ao iniciar o novo ciclo.
            Duration duracaoEfetiva = duracaoAtual;
            Duration proximo = obterDuracaoValida(usuario.getProximoIntervalo());
            if (proximo != null) {
                duracaoEfetiva = proximo;
                usuario.setIntervaloAtividade(duracaoEfetiva);
                usuario.setProximoIntervalo(null);
            }

            LocalDateTime novoPrazo = agora.plus(duracaoEfetiva);
            usuario.setUltimaAtividade(agora);
            usuario.setUltimoPrazo(novoPrazo);
            usuario.setCicloDescongelamento(true);

            inicioCicloParaPontos = agora;
            podePontuarComunidade = false;

            String msg = montarMensagemCongelada(novoPrazo);
            result = new StreakUpdateResult("UNFROZEN", usuario.getStreakNum(), EstadoStreak.PENDENTE, novoPrazo, msg);
        }

        userRepository.save(usuario);

        if (podePontuarComunidade) {
            ParticipamId participamId = new ParticipamId(usuario.getId(), idComunidade);
            Participam participam = participamRepository.findById(participamId).orElse(null);
            if (participam != null) {
                LocalDateTime ultimaPontuacao = participam.getUltimaPontuacao();
                boolean jaPontuouNestaComunidade = ultimaPontuacao != null
                        && ultimaPontuacao.isAfter(inicioCicloParaPontos);

                if (!jaPontuouNestaComunidade) {
                    participam.setPontos(participam.getPontos() + 1);
                    participam.setUltimaPontuacao(agora);
                    participamRepository.save(participam);
                }
            }
        }

        return result;
    }

    private String montarMensagemAumento(int novoStreak, LocalDateTime dataReset) {
        String dataFormatada = dataReset.format(DATE_FORMATTER);
        return "Bom trabalho! A sua sequência aumentou para " + novoStreak
                + ". Volte no dia " + dataFormatada + ". Continue assim!";
    }

    private String montarMensagemCongelada(LocalDateTime dataReset) {
        String dataFormatada = dataReset.format(DATE_FORMATTER);
        return "Você postou depois do prazo, então a sequência não contará dessa vez. Volte no dia "
                + dataFormatada + " para retomar!";
    }

    private String montarMensagemAguardandoRetomada(LocalDateTime dataReset) {
        String dataFormatada = dataReset.format(DATE_FORMATTER);
        return "Sua sequência está em descongelamento e ainda não conta neste ciclo. Volte no dia "
                + dataFormatada + " para retomar!";
    }
}
