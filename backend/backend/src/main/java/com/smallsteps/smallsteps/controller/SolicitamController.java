package com.smallsteps.smallsteps.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.smallsteps.smallsteps.dto.SolicitacaoResponseDTO;
import com.smallsteps.smallsteps.dto.SolicitamDTO;
import com.smallsteps.smallsteps.entity.Participam;
import com.smallsteps.smallsteps.entity.Solicitam;
import com.smallsteps.smallsteps.service.SolicitamService;

@CrossOrigin
@RestController
@RequestMapping("/solicitam")
public class SolicitamController {

    private final SolicitamService solicitamService;

    public SolicitamController(SolicitamService solicitamService) {
        this.solicitamService = solicitamService;
    }

    @GetMapping("/comunidade/{idComunidade}")
    public List<SolicitacaoResponseDTO> getByComunidade(@PathVariable int idComunidade) {
        return solicitamService.findByComunidade(idComunidade);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Solicitam create(@RequestBody SolicitamDTO dto) {
        return solicitamService.create(dto);
    }

    @PostMapping("/{idComunidade}/{idUsuario}/aceitar")
    public Participam accept(@PathVariable int idComunidade, @PathVariable int idUsuario) {
        return solicitamService.accept(idComunidade, idUsuario);
    }

    @DeleteMapping("/{idComunidade}/{idUsuario}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void reject(@PathVariable int idComunidade, @PathVariable int idUsuario) {
        solicitamService.reject(idComunidade, idUsuario);
    }
}
