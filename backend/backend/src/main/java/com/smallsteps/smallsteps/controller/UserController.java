package com.smallsteps.smallsteps.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@CrossOrigin
@RestController
@RequestMapping("/user")
public class UserController {

@PostMapping("")
public String postMethodName(@RequestBody String entity) {
    
    return entity;
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
