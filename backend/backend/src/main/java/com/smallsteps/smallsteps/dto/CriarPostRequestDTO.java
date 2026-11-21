package com.smallsteps.smallsteps.dto;

public class CriarPostRequestDTO {
    private String descricao;
    private String tipoMidia;
    private String urlMidia;
    private Integer idUsuario;

    public CriarPostRequestDTO() {}

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getTipoMidia() {
        return tipoMidia != null ? tipoMidia : "TEXT";
    }

    public void setTipoMidia(String tipoMidia) {
        this.tipoMidia = tipoMidia;
    }

    public String getUrlMidia() {
        return urlMidia;
    }

    public void setUrlMidia(String urlMidia) {
        this.urlMidia = urlMidia;
    }

    public Integer getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Integer idUsuario) {
        this.idUsuario = idUsuario;
    }
}
