package com.smallsteps.smallsteps.dto;

public class CriarComentarioRequestDTO {
    private String conteudo;
    private Integer idUsuario;

    public CriarComentarioRequestDTO() {}

    public String getConteudo() {
        return conteudo;
    }

    public void setConteudo(String conteudo) {
        this.conteudo = conteudo;
    }

    public Integer getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Integer idUsuario) {
        this.idUsuario = idUsuario;
    }
}
