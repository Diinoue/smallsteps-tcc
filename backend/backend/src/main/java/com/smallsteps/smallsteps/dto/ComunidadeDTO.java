package com.smallsteps.smallsteps.dto;

import java.time.LocalDateTime;

public class ComunidadeDTO {
    public int id;
    public String nome;
    public boolean privado;
    public LocalDateTime dtCriacao;
    public String foto;

    public ComunidadeDTO() {}

    public ComunidadeDTO(int id, String nome, boolean privado, LocalDateTime dtCriacao, String foto) {
        this.id = id;
        this.nome = nome;
        this.privado = privado;
        this.dtCriacao = dtCriacao;
        this.foto = foto;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public boolean isPrivado() {
        return privado;
    }

    public void setPrivado(boolean privado) {
        this.privado = privado;
    }

    public LocalDateTime getDtCriacao() {
        return dtCriacao;
    }

    public void setDtCriacao(LocalDateTime dtCriacao) {
        this.dtCriacao = dtCriacao;
    }

    public String getFoto() {
        return foto;
    }

    public void setFoto(String foto) {
        this.foto = foto;
    }
}
