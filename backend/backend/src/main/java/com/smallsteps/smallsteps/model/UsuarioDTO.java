package com.smallsteps.smallsteps.model;

import java.time.LocalDateTime;
import com.smallsteps.smallsteps.enums.StreakStatus;

public class UsuarioDTO {
    public int id;
    public String nome;
    public String email;
    public String descricao;
    public int streakNum;
    public StreakStatus streakStatus;
    public LocalDateTime ultimaAtividade;
}
