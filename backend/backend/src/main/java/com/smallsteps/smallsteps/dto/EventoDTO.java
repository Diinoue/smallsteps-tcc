package com.smallsteps.smallsteps.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class EventoDTO {
    public int id;
    public String titulo;
    public String descricao;
    public String local;
    public LocalTime horarioInicio;
    public LocalTime horarioFim;
    public LocalDate diaInicio;
    public LocalDate diaFim;
    public int idUsuario;
    public int idComunidade;
}
