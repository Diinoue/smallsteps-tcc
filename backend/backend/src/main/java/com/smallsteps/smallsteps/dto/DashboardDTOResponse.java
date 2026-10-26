package com.smallsteps.smallsteps.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.smallsteps.smallsteps.enums.StreakStatus;

public class DashboardDTOResponse {
        public int streakNum;
        public StreakStatus streakStatus;
        public LocalDateTime ultimaAtividade;
        public List<GoalDTOResponse> metas = new ArrayList<GoalDTOResponse>();
}
