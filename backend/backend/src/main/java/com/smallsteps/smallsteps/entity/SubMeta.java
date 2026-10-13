package com.smallsteps.smallsteps.entity;

import java.time.LocalDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "sub_meta")
public class SubMeta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private int id;

    @Column(name = "concluido", nullable = false)
    private boolean concluido;

    @Column(name = "titulo", nullable = false)
    private String titulo;

    @Column(name = "pos", nullable = false)
    private int pos;

    @Column(name = "dt_inicio", nullable = false)
    private LocalDateTime dtInicio;

    @Column(name = "dt_fim")
    private LocalDateTime dtFim;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_meta", nullable = false)
    private Meta meta;

    public SubMeta() {}

    public SubMeta(int id, boolean concluido, String titulo, int pos, LocalDateTime dtInicio, LocalDateTime dtFim, Meta meta) {
        this.id = id;
        this.concluido = concluido;
        this.titulo = titulo;
        this.pos = pos;
        this.dtInicio = dtInicio;
        this.dtFim = dtFim;
        this.meta = meta;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public boolean isConcluido() {
        return concluido;
    }

    public void setConcluido(boolean concluido) {
        this.concluido = concluido;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public int getPos() {
        return pos;
    }

    public void setPos(int pos) {
        this.pos = pos;
    }

    public LocalDateTime getDtInicio() {
        return dtInicio;
    }

    public void setDtInicio(LocalDateTime dtInicio) {
        this.dtInicio = dtInicio;
    }

    public LocalDateTime getDtFim() {
        return dtFim;
    }

    public void setDtFim(LocalDateTime dtFim) {
        this.dtFim = dtFim;
    }

    public Meta getMeta() {
        return meta;
    }

    public void setMeta(Meta meta) {
        this.meta = meta;
    }

    public int getIdMeta() {
        return meta != null ? meta.getId() : 0;
    }
}
