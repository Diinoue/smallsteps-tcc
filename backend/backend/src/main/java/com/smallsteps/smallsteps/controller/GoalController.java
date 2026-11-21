package com.smallsteps.smallsteps.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import com.smallsteps.smallsteps.dto.CriarMetaDTO;
import com.smallsteps.smallsteps.dto.GoalDTOResponse;
import com.smallsteps.smallsteps.service.GoalService;

@CrossOrigin
@RestController
@RequestMapping("/goals")
public class GoalController {

    private final GoalService goalService;

    public GoalController(GoalService goalService) {
        this.goalService = goalService;
    }

    // GET /goals/usuario/{idUsuario} — listar todas as metas do usuário (não concluídas primeiro)
    @GetMapping("/usuario/{idUsuario}")
    public List<GoalDTOResponse> getByUsuario(@PathVariable int idUsuario) {
        return goalService.findAllByUsuario(idUsuario);
    }

    // GET /goals/{id} — buscar meta por ID
    @GetMapping("/{id}")
    public GoalDTOResponse getById(@PathVariable int id) {
        return goalService.findById(id);
    }

    // POST /goals — criar nova meta
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public GoalDTOResponse create(@RequestBody CriarMetaDTO dto) {
        return goalService.create(dto);
    }

    // PUT /goals/{id} — atualizar meta
    @PutMapping("/{id}")
    public GoalDTOResponse update(@PathVariable int id, @RequestBody CriarMetaDTO dto) {
        return goalService.update(id, dto);
    }

    // DELETE /goals/{id} — excluir meta
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable int id) {
        goalService.delete(id);
    }

    // PATCH /goals/{id}/concluir — marcar como concluída
    @PatchMapping("/{id}/concluir")
    public GoalDTOResponse concluir(@PathVariable int id) {
        return goalService.concluir(id);
    }
}
