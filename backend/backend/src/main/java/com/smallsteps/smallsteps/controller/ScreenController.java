package com.smallsteps.smallsteps.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smallsteps.smallsteps.dto.DashboardDTOResponse;
import com.smallsteps.smallsteps.security.AuthenticatedUserService;
import com.smallsteps.smallsteps.service.UserService;

@CrossOrigin
@RestController
@RequestMapping("/screen")
public class ScreenController {

    private final UserService userService;
    private final AuthenticatedUserService authenticatedUserService;

    public ScreenController(UserService userService, AuthenticatedUserService authenticatedUserService) {
        this.userService = userService;
        this.authenticatedUserService = authenticatedUserService;
    }

    @GetMapping("/dashboard")
    public DashboardDTOResponse getMyDashboard(Authentication authentication) {
        int idUsuario = authenticatedUserService.getCurrentUserId(authentication);
        return userService.getDashboard(idUsuario);
    }

    @GetMapping("/dashboard/{idUsuario}")
    public DashboardDTOResponse getDashboard(@PathVariable int idUsuario, Authentication authentication) {
        int currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        return userService.getDashboard(currentUserId);
    }
}