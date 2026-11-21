package com.smallsteps.smallsteps.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ComunidadeDTO {
    public int id;
    public String nome;
    public boolean privado;
    public LocalDateTime dtCriacao;
    public String foto;
    public String descricao;
    public Integer idUsuario;
    public List<String> tags;
    public boolean jaParticipa;
    public boolean jaSolicitou;
    public String codigoConvite;
    public int quantidadeMembros;

    public ComunidadeDTO() {}

    public ComunidadeDTO(int id, String nome, boolean privado, LocalDateTime dtCriacao, String foto) {
        this.id = id;
        this.nome = nome;
        this.privado = privado;
        this.dtCriacao = dtCriacao;
        this.foto = foto;
    }

    public ComunidadeDTO(int id, String nome, boolean privado, LocalDateTime dtCriacao, String foto, String descricao) {
        this.id = id;
        this.nome = nome;
        this.privado = privado;
        this.dtCriacao = dtCriacao;
        this.foto = foto;
        this.descricao = descricao;
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

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public Integer getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Integer idUsuario) {
        this.idUsuario = idUsuario;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public boolean isJaParticipa() {
        return jaParticipa;
    }

    public void setJaParticipa(boolean jaParticipa) {
        this.jaParticipa = jaParticipa;
    }

    public boolean isJaSolicitou() {
        return jaSolicitou;
    }

    public void setJaSolicitou(boolean jaSolicitou) {
        this.jaSolicitou = jaSolicitou;
    }

    public String getCodigoConvite() {
        return codigoConvite;
    }

    public void setCodigoConvite(String codigoConvite) {
        this.codigoConvite = codigoConvite;
    }

    public int getQuantidadeMembros() {
        return quantidadeMembros;
    }

    public void setQuantidadeMembros(int quantidadeMembros) {
        this.quantidadeMembros = quantidadeMembros;
    }
}
