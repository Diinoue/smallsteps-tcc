package com.smallsteps.smallsteps.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.smallsteps.smallsteps.dto.DashboardDTOResponse;
import com.smallsteps.smallsteps.dto.GoalDTOResponse;
import com.smallsteps.smallsteps.dto.SubGoalDTOResponse;
import com.smallsteps.smallsteps.entity.Meta;
import com.smallsteps.smallsteps.entity.SubMeta;
import com.smallsteps.smallsteps.entity.Usuario;
import com.smallsteps.smallsteps.repository.GoalRepository;
import com.smallsteps.smallsteps.repository.UserRepository;

@Service 
public class UserService {

    private final UserRepository userRepository;
    private final GoalRepository goalRepository;

    public UserService(UserRepository userRepository, GoalRepository goalRepository) {
        this.userRepository = userRepository;
        this.goalRepository = goalRepository;
    }

    public List<Usuario> readUsuario() {
        List<Usuario> lista = new ArrayList<>();
        return lista;
    }

    public Usuario createUsuario(Usuario user) {
        return new Usuario();
    }

    public Usuario updateUsuario(Usuario user) {
        return new Usuario();
    }

    public boolean deleteUsuario(int id) {
        return true;
    }

    public DashboardDTOResponse getDashboard(int idUsuario) {
        Usuario usuario = userRepository.findById(idUsuario)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Usuário não encontrado"));

        List<Meta> metas = goalRepository.findByUsuarioIdAndConcluidoFalse(idUsuario);

        Map<Integer, List<SubMeta>> subMetasPorMeta = goalRepository
                .findSubMetasByUsuario(idUsuario)
                .stream()
                .collect(Collectors.groupingBy(SubMeta::getIdMeta));

        DashboardDTOResponse dashboard = new DashboardDTOResponse();
        dashboard.streakNum = usuario.getStreakNum();
        dashboard.streakStatus = usuario.getStreakStatus();
        dashboard.ultimaAtividade = usuario.getUltimaAtividade();

        for (Meta meta : metas) {
            GoalDTOResponse goalDto = new GoalDTOResponse();
            goalDto.id = meta.getId();
            goalDto.title = meta.getTitulo();
            goalDto.concluido = meta.isConcluido();
            goalDto.dtInicio = meta.getDtInicio();
            goalDto.dtFim = meta.getDtFim();

            for (SubMeta sub : subMetasPorMeta.getOrDefault(meta.getId(), List.of())) {
                SubGoalDTOResponse subDto = new SubGoalDTOResponse();
                subDto.id = sub.getId();
                subDto.concluido = sub.isConcluido();
                subDto.titulo = sub.getTitulo();
                subDto.dtInicio = sub.getDtInicio();
                subDto.dtFim = sub.getDtFim();
                subDto.pos = sub.getPos();
                goalDto.subMetas.add(subDto);
            }

            dashboard.metas.add(goalDto);
        }

        return dashboard;
    }
}

