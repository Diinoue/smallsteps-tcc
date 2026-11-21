package com.smallsteps.smallsteps.dto;

import java.time.LocalDateTime;

public class SolicitacaoResponseDTO {
    private int idUsuario;
    private int idComunidade;
    private String nomeUsuario;
    private String fotoUsuario;
    private LocalDateTime dtInicio;

    public SolicitacaoResponseDTO() {}

    public SolicitacaoResponseDTO(
            int idUsuario,
            int idComunidade,
            String nomeUsuario,
            String fotoUsuario,
            LocalDateTime dtInicio) {
        this.idUsuario = idUsuario;
        this.idComunidade = idComunidade;
        this.nomeUsuario = nomeUsuario;
        this.fotoUsuario = fotoUsuario;
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

    public String getNomeUsuario() {
        return nomeUsuario;
    }

    public void setNomeUsuario(String nomeUsuario) {
        this.nomeUsuario = nomeUsuario;
    }

    public String getFotoUsuario() {
        return fotoUsuario;
    }

    public void setFotoUsuario(String fotoUsuario) {
        this.fotoUsuario = fotoUsuario;
    }

    public LocalDateTime getDtInicio() {
        return dtInicio;
    }

    public void setDtInicio(LocalDateTime dtInicio) {
        this.dtInicio = dtInicio;
    }
}
