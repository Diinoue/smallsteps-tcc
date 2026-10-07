package com.smallsteps.smallsteps.model;

import java.util.Date;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity 
@Table(name = "users")
public class User {

    @Id 
    @GeneratedValue(strategy=GenerationType.AUTO)
    private Integer id;
    private String nome;
    private String email;
    private String descricao;
    private Integer streakNum;
    private streakStatus streakStatus;
    private Date ultimaAtividade;

    // DIOGO - 06/10 - PROVISÓRIO, REMOVER DEPOIS
    private String senha;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public Integer getStreakNum() {
        return streakNum;
    }

    public void setStreakNum(Integer streakNum) {
        this.streakNum = streakNum;
    }

    public streakStatus getStreakStatus() {
        return streakStatus;
    }

    public void setStreakStatus(streakStatus streakStatus) {
        this.streakStatus = streakStatus;
    }

    public Date getUltimaAtividade() {
        return ultimaAtividade;
    }

    public void setUltimaAtividade(Date ultimaAtividade) {
        this.ultimaAtividade = ultimaAtividade;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }
}
