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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.smallsteps.smallsteps.dto.CriarEventoDTO;
import com.smallsteps.smallsteps.dto.EventoResponseDTO;
import com.smallsteps.smallsteps.service.EventoService;

@CrossOrigin
@RestController
public class EventoController {

    private final EventoService eventoService;

    public EventoController(EventoService eventoService) {
        this.eventoService = eventoService;
    }

    // Listar eventos da comunidade
    @GetMapping("/community/{communityId}/events")
    public List<EventoResponseDTO> getEventsByCommunity(@PathVariable int communityId) {
        return eventoService.findByComunidade(communityId);
    }

    // Criar evento dentro da comunidade
    @PostMapping("/community/{communityId}/events")
    @ResponseStatus(HttpStatus.CREATED)
    public EventoResponseDTO createEvent(
            @PathVariable int communityId,
            @RequestBody CriarEventoDTO dto) {
        return eventoService.create(communityId, dto);
    }

    // Listar todos os eventos (ou filtrar por comunidade)
    @GetMapping("/events")
    public List<EventoResponseDTO> getAllEvents(@RequestParam(required = false) Integer communityId) {
        if (communityId != null) {
            return eventoService.findByComunidade(communityId);
        }
        return eventoService.findAll();
    }

    // Buscar evento por ID
    @GetMapping("/events/{id}")
    public EventoResponseDTO getEventById(@PathVariable int id) {
        return eventoService.findById(id);
    }

    // Atualizar evento por ID
    @PutMapping("/events/{id}")
    public EventoResponseDTO updateEvent(
            @PathVariable int id,
            @RequestBody CriarEventoDTO dto) {
        return eventoService.update(id, dto);
    }

    // Deletar evento por ID
    @DeleteMapping("/events/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEvent(@PathVariable int id) {
        eventoService.delete(id);
    }
}
