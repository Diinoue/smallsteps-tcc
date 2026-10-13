package com.smallsteps.smallsteps.model;

import java.time.LocalDateTime;
import com.smallsteps.smallsteps.enums.Cargo;

public class ParticipamDTO {
    public int idUsuario;
    public int idComunidade;
    public int pontos;
    public Cargo cargo;
    public LocalDateTime dtInicio;
}
