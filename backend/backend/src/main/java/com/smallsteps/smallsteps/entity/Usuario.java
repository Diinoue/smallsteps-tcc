package com.smallsteps.smallsteps.entity;

import java.time.Duration;
import java.time.LocalDateTime;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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

    @Column(name = "senha")
    private String senha;

    @Column(name = "foto")
    private String foto;

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

    @Column(name = "streak_publico")
    private Boolean streakPublico = false;

    @Column(name = "metas_publicas")
    private Boolean metasPublicas = true;

    @Column(name = "frequencia_num")
    private Integer frequenciaNum = 2;

    @Column(name = "frequencia_periodo")
    private String frequenciaPeriodo = "week";

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

    public String getFoto() {
        return foto;
    }

    public void setFoto(String foto) {
        this.foto = foto;
    }

    public boolean isStreakPublico() {
        return streakPublico != null && streakPublico;
    }

    public void setStreakPublico(Boolean streakPublico) {
        this.streakPublico = streakPublico != null ? streakPublico : false;
    }

    public boolean isMetasPublicas() {
        return metasPublicas == null || metasPublicas;
    }

    public void setMetasPublicas(Boolean metasPublicas) {
        this.metasPublicas = metasPublicas != null ? metasPublicas : true;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public Integer getFrequenciaNum() {
        return frequenciaNum != null ? frequenciaNum : 2;
    }

    public void setFrequenciaNum(Integer frequenciaNum) {
        this.frequenciaNum = frequenciaNum;
    }

    public String getFrequenciaPeriodo() {
        return frequenciaPeriodo != null ? frequenciaPeriodo : "week";
    }

    public void setFrequenciaPeriodo(String frequenciaPeriodo) {
        this.frequenciaPeriodo = frequenciaPeriodo;
    }

    
}
