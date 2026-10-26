package com.smallsteps.smallsteps.entity;

import java.time.LocalDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import com.smallsteps.smallsteps.enums.StreakStatus;

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

    @Enumerated(EnumType.STRING)
    @Column(name = "streak_status", nullable = false)
    private StreakStatus streakStatus;

    @Column(name = "ultima_atividade")
    private LocalDateTime ultimaAtividade;

    public Usuario() {}

    public Usuario(int id, String nome, String email, String descricao, int streakNum, StreakStatus streakStatus, LocalDateTime ultimaAtividade) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.descricao = descricao;
        this.streakNum = streakNum;
        this.streakStatus = streakStatus;
        this.ultimaAtividade = ultimaAtividade;
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

    public StreakStatus getStreakStatus() {
        return streakStatus;
    }

    public void setStreakStatus(StreakStatus streakStatus) {
        this.streakStatus = streakStatus;
    }

    public LocalDateTime getUltimaAtividade() {
        return ultimaAtividade;
    }

    public void setUltimaAtividade(LocalDateTime ultimaAtividade) {
        this.ultimaAtividade = ultimaAtividade;
    }
}
