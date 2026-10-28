package com.smallsteps.smallsteps.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.smallsteps.smallsteps.model.Login;
import com.smallsteps.smallsteps.security.AuthenticationService;

@RestController
public class AuthenticationController {

    @Autowired
    private AuthenticationService authenticationService;

    @Autowired
    private AuthenticationManager authenticationManager;

    // @PostMapping("/login")
    // public String authenticate(Authentication authentication) {
    //     return authenticationService.authenticate(authentication);
    // }

     @PostMapping("/login")
    public Map<String, String> authenticate(@RequestBody Login loginRequest) {
        var authToken = new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword());        
        Authentication authentication = authenticationManager.authenticate(authToken);
        String token = authenticationService.authenticate(authentication);
        return Map.of("token", token);
    }
}
