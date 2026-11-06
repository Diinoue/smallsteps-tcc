package com.smallsteps.smallsteps.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.smallsteps.smallsteps.dto.ParticipamDTO;
import com.smallsteps.smallsteps.entity.Participam;
import com.smallsteps.smallsteps.service.ParticipamService;

@CrossOrigin
@RestController
@RequestMapping("/participam")
public class ParticipamController {

    private final ParticipamService participamService;

    public ParticipamController(ParticipamService participamService) {
        this.participamService = participamService;
    }

    @GetMapping
    public List<Participam> getAll(
            @RequestParam(required = false) Integer idComunidade,
            @RequestParam(required = false) Integer idUsuario) {
        if (idComunidade != null) {
            return participamService.findByComunidade(idComunidade);
        }
        if (idUsuario != null) {
            return participamService.findByUsuario(idUsuario);
        }
        return participamService.findAll();
    }

    @GetMapping("/{idUsuario}/{idComunidade}")
    public Participam getById(@PathVariable int idUsuario, @PathVariable int idComunidade) {
        return participamService.findById(idUsuario, idComunidade);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Participam create(@RequestBody ParticipamDTO dto) {
        return participamService.create(dto);
    }

    @PutMapping("/{idUsuario}/{idComunidade}")
    public Participam update(
            @PathVariable int idUsuario,
            @PathVariable int idComunidade,
            @RequestBody ParticipamDTO dto) {
        return participamService.update(idUsuario, idComunidade, dto);
    }

    @DeleteMapping("/{idUsuario}/{idComunidade}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable int idUsuario, @PathVariable int idComunidade) {
        participamService.delete(idUsuario, idComunidade);
    }
}
