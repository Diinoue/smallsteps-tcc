package com.smallsteps.smallsteps.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class GoalDTOResponse {
    public int id;
    public Integer idUsuario;
    public String title;
    public String milestone;
    public boolean concluido;
    public LocalDateTime dtInicio;
    public LocalDateTime dtFim;

    public List<SubGoalDTOResponse> subMetas = new ArrayList<SubGoalDTOResponse>();
}
