package com.smallsteps.smallsteps.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import com.smallsteps.smallsteps.entity.Evento;

public class EventoResponseDTO {
    private int id;
    private String titulo;
    private String descricao;
    private String local;
    private LocalDate diaInicio;
    private LocalDate diaFim;
    private LocalTime horarioInicio;
    private LocalTime horarioFim;
    private String formattedDate;
    private int idUsuario;
    private String nomeUsuario;
    private int idComunidade;
    private String nomeComunidade;
    private String foto;

    public EventoResponseDTO() {}

    public EventoResponseDTO(Evento evento) {
        this.id = evento.getId();
        this.titulo = evento.getTitulo();
        this.descricao = evento.getDescricao();
        this.local = evento.getLocal();
        this.diaInicio = evento.getDiaInicio();
        this.diaFim = evento.getDiaFim();
        this.horarioInicio = evento.getHorarioInicio();
        this.horarioFim = evento.getHorarioFim();
        this.foto = evento.getFoto();

        // Formatação inteligente da data idêntica ao protótipo visual
        this.formattedDate = buildFormattedDate(
            evento.getDiaInicio(),
            evento.getDiaFim(),
            evento.getHorarioInicio(),
            evento.getHorarioFim()
        );

        if (evento.getUsuario() != null) {
            this.idUsuario = evento.getUsuario().getId();
            this.nomeUsuario = evento.getUsuario().getNome();
        }

        if (evento.getComunidade() != null) {
            this.idComunidade = evento.getComunidade().getId();
            this.nomeComunidade = evento.getComunidade().getNome();
        }
    }

    private String buildFormattedDate(LocalDate dInicio, LocalDate dFim, LocalTime hInicio, LocalTime hFim) {
        if (dInicio == null) return "";
        DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("dd/MM/yy");
        DateTimeFormatter timeFmt = DateTimeFormatter.ofPattern("HH:mm");

        String timeStr = "";
        if (hInicio != null && hFim != null) {
            timeStr = " " + hInicio.format(timeFmt) + " - " + hFim.format(timeFmt);
        } else if (hInicio != null) {
            timeStr = " " + hInicio.format(timeFmt);
        }

        LocalDate fim = dFim != null ? dFim : dInicio;
        return dInicio.format(dateFmt) + " - " + fim.format(dateFmt) + timeStr;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getLocal() {
        return local;
    }

    public void setLocal(String local) {
        this.local = local;
    }

    public LocalDate getDiaInicio() {
        return diaInicio;
    }

    public void setDiaInicio(LocalDate diaInicio) {
        this.diaInicio = diaInicio;
    }

    public LocalDate getDiaFim() {
        return diaFim;
    }

    public void setDiaFim(LocalDate diaFim) {
        this.diaFim = diaFim;
    }

    public LocalTime getHorarioInicio() {
        return horarioInicio;
    }

    public void setHorarioInicio(LocalTime horarioInicio) {
        this.horarioInicio = horarioInicio;
    }

    public LocalTime getHorarioFim() {
        return horarioFim;
    }

    public void setHorarioFim(LocalTime horarioFim) {
        this.horarioFim = horarioFim;
    }

    public String getFormattedDate() {
        return formattedDate;
    }

    public void setFormattedDate(String formattedDate) {
        this.formattedDate = formattedDate;
    }

    public int getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(int idUsuario) {
        this.idUsuario = idUsuario;
    }

    public String getNomeUsuario() {
        return nomeUsuario;
    }

    public void setNomeUsuario(String nomeUsuario) {
        this.nomeUsuario = nomeUsuario;
    }

    public int getIdComunidade() {
        return idComunidade;
    }

    public void setIdComunidade(int idComunidade) {
        this.idComunidade = idComunidade;
    }

    public String getNomeComunidade() {
        return nomeComunidade;
    }

    public void setNomeComunidade(String nomeComunidade) {
        this.nomeComunidade = nomeComunidade;
    }

    public String getFoto() {
        return foto;
    }

    public void setFoto(String foto) {
        this.foto = foto;
    }
}
