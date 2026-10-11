package com.smallsteps.smallsteps.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smallsteps.smallsteps.dto.UserDTO;
// import com.smallsteps.smallsteps.model.User;
import com.smallsteps.smallsteps.entity.User;
import com.smallsteps.smallsteps.service.UserService;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;

@CrossOrigin
@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

@PostMapping
@ResponseStatus(HttpStatus.CREATED)
public User create(@RequestBody UserDTO dto) {
    User user = new User();
    user.setName(dto.getName());
    user.setEmail(dto.getEmail());
    user.setPassword(dto.getPassword());

    System.out.println(user.toString());
    return userService.createUsuario(user);
}


@PutMapping("/{id}")
public String putMethodName(@PathVariable String id, @RequestBody String entity) {    
    return entity;
}

@GetMapping("")
public String getMethodName(@RequestParam String param) {
    return new String();
}

@DeleteMapping("")
public String deleteMethodName(@PathVariable String param) {
    return new String();
}
}
