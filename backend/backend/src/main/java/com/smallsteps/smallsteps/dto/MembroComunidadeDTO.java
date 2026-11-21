package com.smallsteps.smallsteps.dto;

import java.time.LocalDateTime;

import com.smallsteps.smallsteps.enums.Cargo;

public class MembroComunidadeDTO {
    private int idUsuario;
    private int idComunidade;
    private String nome;
    private String foto;
    private int pontos;
    private Cargo cargo;
    private LocalDateTime dtInicio;

    public MembroComunidadeDTO() {}

    public MembroComunidadeDTO(
            int idUsuario,
            int idComunidade,
            String nome,
            String foto,
            int pontos,
            Cargo cargo,
            LocalDateTime dtInicio) {
        this.idUsuario = idUsuario;
        this.idComunidade = idComunidade;
        this.nome = nome;
        this.foto = foto;
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

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getFoto() {
        return foto;
    }

    public void setFoto(String foto) {
        this.foto = foto;
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
