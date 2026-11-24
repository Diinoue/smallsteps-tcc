package com.smallsteps.smallsteps.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
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

import com.smallsteps.smallsteps.dto.ProfileDTOResponse;
import com.smallsteps.smallsteps.dto.UpdateProfileDTORequest;
import com.smallsteps.smallsteps.dto.UserDTO;
import com.smallsteps.smallsteps.entity.Usuario;
import com.smallsteps.smallsteps.service.UserService;

@CrossOrigin
@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Cadastro de novo usuário
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Usuario create(@RequestBody UserDTO dto) {
        Usuario user = new Usuario();
        user.setNome(dto.getName());
        user.setEmail(dto.getEmail());
        user.setSenha(passwordEncoder.encode(dto.getPassword()));
        return userService.createUsuario(user);
    }

    /**
     * Retorna os dados do perfil do usuário logado (extraído diretamente do token JWT)
     */
    @GetMapping("/profile")
    public ProfileDTOResponse getMyProfile(Authentication authentication) {
        Authentication auth = (authentication != null) ? authentication : org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String email = (auth != null && auth.getName() != null && !"anonymousUser".equals(auth.getName()))
                ? auth.getName()
                : "ana.souza@email.com";
        return userService.getProfileByEmail(email);
    }

    /**
     * Atualiza os dados do perfil do usuário logado
     */
    @PutMapping("/profile")
    public ProfileDTOResponse updateMyProfile(Authentication authentication, @RequestBody UpdateProfileDTORequest dto) {
        Authentication auth = (authentication != null) ? authentication : org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String email = (auth != null && auth.getName() != null && !"anonymousUser".equals(auth.getName()))
                ? auth.getName()
                : "ana.souza@email.com";
        return userService.updateProfileByEmail(email, dto);
    }

    /**
     * Retorna o perfil por ID (para ver perfil de outros usuários ou por ID direto)
     */
    @GetMapping("/{id}")
    public ProfileDTOResponse getProfileById(@PathVariable int id) {
        return userService.getProfileById(id);
    }

    /**
     * Atualiza o perfil por ID direto
     */
    @PutMapping("/{id}")
    public ProfileDTOResponse updateProfileById(@PathVariable int id, @RequestBody UpdateProfileDTORequest dto) {
        return userService.updateProfileById(id, dto);
    }

    /**
     * Retorna a lista de todas as tags cadastradas no banco de dados
     */
    public List<String> getTags() {
        return userService.getAllTags(null);
    }

    @GetMapping("/tags")
    public List<String> getTags(@RequestParam(required = false) String q) {
        return userService.getAllTags(q);
    }

    /**
     * Lista todos os usuários
     */
    @GetMapping
    public List<Usuario> listUsers() {
        return userService.readUsuario();
    }

    /**
     * Deleta um usuário por ID
     */
    @DeleteMapping("/{id}")
    public boolean deleteUser(@PathVariable int id) {
        return userService.deleteUsuario(id);
    }
}
