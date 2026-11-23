package com.smallsteps.smallsteps.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.smallsteps.smallsteps.config.FlexibleLocalDateTimeDeserializer;

public class CriarMetaDTO {
    public String titulo;
    public String milestone;
    public int idUsuario;
    public Boolean visivel;
    public Boolean concluido;
    
    @JsonDeserialize(using = FlexibleLocalDateTimeDeserializer.class)
    public LocalDateTime dtInicio;

    @JsonDeserialize(using = FlexibleLocalDateTimeDeserializer.class)
    public LocalDateTime dtFim;
    
    public String urlMidia;
    public String tipoMidia;

    public List<SubMetaDTO> subMetas;
}
