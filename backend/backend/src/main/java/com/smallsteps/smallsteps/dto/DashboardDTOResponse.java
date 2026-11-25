package com.smallsteps.smallsteps.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.time.Duration;

public class DashboardDTOResponse {
        public int streakNum;
        public LocalDateTime ultimaAtividade;
        public LocalDateTime ultimoPrazo;
        public Duration intervaloAtividade;
        public Duration proximoIntervalo;
        public boolean cicloDescongelamento;
        public String streakStatus;
        public List<GoalDTOResponse> metas = new ArrayList<GoalDTOResponse>();
}
