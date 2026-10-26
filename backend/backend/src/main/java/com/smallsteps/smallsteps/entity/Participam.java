package com.smallsteps.smallsteps.entity;

import java.time.LocalDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import com.smallsteps.smallsteps.enums.Cargo;

@Entity
@Table(name = "participam")
@IdClass(ParticipamId.class)
public class Participam {

    @Id
    @Column(name = "id_usuario")
    private int idUsuario;

    @Id
    @Column(name = "id_comunidade")
    private int idComunidade;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", insertable = false, updatable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_comunidade", insertable = false, updatable = false)
    private Comunidade comunidade;

    @Column(name = "pontos", nullable = false)
    private int pontos;

    @Enumerated(EnumType.STRING)
    @Column(name = "cargo", nullable = false)
    private Cargo cargo;

    @Column(name = "dt_inicio", nullable = false)
    private LocalDateTime dtInicio;

    public Participam() {}

    public Participam(int idUsuario, int idComunidade, int pontos, Cargo cargo, LocalDateTime dtInicio) {
        this.idUsuario = idUsuario;
        this.idComunidade = idComunidade;
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

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
        if (usuario != null) {
            this.idUsuario = usuario.getId();
        }
    }

    public Comunidade getComunidade() {
        return comunidade;
    }

    public void setComunidade(Comunidade comunidade) {
        this.comunidade = comunidade;
        if (comunidade != null) {
            this.idComunidade = comunidade.getId();
        }
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
