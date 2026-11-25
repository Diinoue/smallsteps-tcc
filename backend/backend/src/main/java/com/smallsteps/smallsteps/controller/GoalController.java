package com.smallsteps.smallsteps.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.smallsteps.smallsteps.dto.CriarMetaDTO;
import com.smallsteps.smallsteps.dto.GoalDTOResponse;
import com.smallsteps.smallsteps.security.AuthenticatedUserService;
import com.smallsteps.smallsteps.service.GoalService;

@CrossOrigin
@RestController
@RequestMapping("/goals")
public class GoalController {

    private final GoalService goalService;
    private final AuthenticatedUserService authenticatedUserService;

    public GoalController(GoalService goalService, AuthenticatedUserService authenticatedUserService) {
        this.goalService = goalService;
        this.authenticatedUserService = authenticatedUserService;
    }

    // GET /goals/me — listar todas as metas do usuário autenticado na sessão
    @GetMapping("/me")
    public List<GoalDTOResponse> getMyGoals(Authentication authentication) {
        int currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        return goalService.findAllByUsuario(currentUserId);
    }

    // GET /goals/usuario/{idUsuario} — listar metas de um usuário específico (ou do próprio)
    @GetMapping("/usuario/{idUsuario}")
    public List<GoalDTOResponse> getByUsuario(@PathVariable int idUsuario) {
        return goalService.findAllByUsuario(idUsuario);
    }

    // GET /goals/{id} — buscar meta por ID
    @GetMapping("/{id}")
    public GoalDTOResponse getById(@PathVariable int id) {
        return goalService.findById(id);
    }

    // POST /goals — criar nova meta para o usuário autenticado
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public GoalDTOResponse create(@RequestBody CriarMetaDTO dto, Authentication authentication) {
        dto.idUsuario = authenticatedUserService.getCurrentUserId(authentication);
        return goalService.create(dto);
    }

    // PUT /goals/{id} — atualizar meta (somente do usuário autenticado)
    @PutMapping("/{id}")
    public GoalDTOResponse update(
            @PathVariable int id,
            @RequestBody CriarMetaDTO dto,
            Authentication authentication) {
        int currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        return goalService.update(id, dto, currentUserId);
    }

    // DELETE /goals/{id} — excluir meta (somente do usuário autenticado)
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable int id, Authentication authentication) {
        int currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        goalService.delete(id, currentUserId);
    }

    // PATCH /goals/{id}/concluir — marcar como concluída (somente do usuário autenticado)
    @PatchMapping("/{id}/concluir")
    public GoalDTOResponse concluir(@PathVariable int id, Authentication authentication) {
        int currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        return goalService.concluir(id, currentUserId);
    }
}
