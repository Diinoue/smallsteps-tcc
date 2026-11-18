package com.smallsteps.smallsteps.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.smallsteps.smallsteps.config.FlexibleLocalDateTimeDeserializer;

public class SubMetaDTO {
    public int id;
    public boolean concluido;
    public String titulo;
    public int pos;
    
    @JsonDeserialize(using = FlexibleLocalDateTimeDeserializer.class)
    public LocalDateTime dtInicio;

    @JsonDeserialize(using = FlexibleLocalDateTimeDeserializer.class)
    public LocalDateTime dtFim;
    
    public int idMeta;
}
