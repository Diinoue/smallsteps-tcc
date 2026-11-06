package com.smallsteps.smallsteps.dto;

import java.time.LocalDateTime;
import com.smallsteps.smallsteps.enums.Cargo;

public class ParticipamDTO {
    public int idUsuario;
    public int idComunidade;
    public int pontos;
    public Cargo cargo;
    public LocalDateTime dtInicio;

    public ParticipamDTO() {}

    public ParticipamDTO(int idUsuario, int idComunidade, int pontos, Cargo cargo, LocalDateTime dtInicio) {
        this.idUsuario = idUsuario;
        this.idComunidade = idComunidade;
        this.pontos = pontos;
        this.cargo = cargo;
        this.dtInicio = dtInicio;
    }

    public int getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(int idUsuario) {
        this.idUsuario = idUsuario;
    }

    public int getIdComunidade() {
        return idComunidade;
    }

    public void setIdComunidade(int idComunidade) {
        this.idComunidade = idComunidade;
    }

    public int getPontos() {
        return pontos;
    }

    public void setPontos(int pontos) {
        this.pontos = pontos;
    }

    public Cargo getCargo() {
        return cargo;
    }

    public void setCargo(Cargo cargo) {
        this.cargo = cargo;
    }

    public LocalDateTime getDtInicio() {
        return dtInicio;
    }

    public void setDtInicio(LocalDateTime dtInicio) {
        this.dtInicio = dtInicio;
    }
}
