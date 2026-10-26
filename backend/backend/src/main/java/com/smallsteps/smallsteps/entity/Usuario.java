package com.smallsteps.smallsteps.entity;

import java.time.Duration;
import java.time.LocalDateTime;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "usuario")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private int id;

    @Column(name = "nome", nullable = false)
    private String nome;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "descricao")
    private String descricao;

    @Column(name = "streak_num", nullable = false)
    private int streakNum;

    @Column(name = "ultima_atividade")
    private LocalDateTime ultimaAtividade;

    @Column(name = "ultimo_prazo")
    private LocalDateTime ultimoPrazo;

    @JdbcTypeCode(SqlTypes.INTERVAL_SECOND)
    @Column(name = "intervalo_atividade")
    private Duration intervaloAtividade;

    public Usuario() {}

    public Usuario(int id, String nome, String email, String descricao, int streakNum,
                   LocalDateTime ultimaAtividade, LocalDateTime ultimoPrazo, 
                   Duration intervaloAtividade) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.descricao = descricao;
        this.streakNum = streakNum;
        this.ultimaAtividade = ultimaAtividade;
        this.ultimoPrazo = ultimoPrazo;
        this.intervaloAtividade = intervaloAtividade;
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

    public int getStreakNum() {
        return streakNum;
    }

    public void setStreakNum(int streakNum) {
        this.streakNum = streakNum;
    }

    public LocalDateTime getUltimaAtividade() {
        return ultimaAtividade;
    }

    public void setUltimaAtividade(LocalDateTime ultimaAtividade) {
        this.ultimaAtividade = ultimaAtividade;
    }

    public LocalDateTime getUltimoPrazo() {
        return ultimoPrazo;
    }

    public void setUltimoPrazo(LocalDateTime ultimoPrazo) {
        this.ultimoPrazo = ultimoPrazo;
    }

    public Duration getIntervaloAtividade() {
        return intervaloAtividade;
    }

    public void setIntervaloAtividade(Duration intervaloAtividade) {
        this.intervaloAtividade = intervaloAtividade;
    }
}