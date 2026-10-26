package com.smallsteps.smallsteps.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smallsteps.smallsteps.dto.DashboardDTOResponse;
import com.smallsteps.smallsteps.service.UserService;

@CrossOrigin 
@RestController 
@RequestMapping("/screen")
public class ScreenController {

private final UserService userService;

public ScreenController(UserService userService) {
    this.userService = userService;
}

@GetMapping("/dashboard/{idUsuario}")
public DashboardDTOResponse getDashboard(@PathVariable int idUsuario) {
    System.out.println("teste");
   return userService.getDashboard(idUsuario);
}


}