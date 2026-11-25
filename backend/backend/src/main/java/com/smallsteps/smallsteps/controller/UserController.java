package com.smallsteps.smallsteps.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
import org.springframework.web.server.ResponseStatusException;

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

    private String requireAuthenticatedEmail(Authentication authentication) {
        Authentication auth = (authentication != null)
                ? authentication
                : SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()
                || auth.getName() == null
                || auth.getName().isBlank()
                || "anonymousUser".equals(auth.getName())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado");
        }
        return auth.getName();
    }

    /**
     * Cadastro de novo usuário
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Usuario create(@RequestBody UserDTO dto) {
        if (dto.getName() == null || dto.getName().isBlank()
                || dto.getEmail() == null || dto.getEmail().isBlank()
                || dto.getPassword() == null || dto.getPassword().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nome, e-mail e senha são obrigatórios");
        }
        Usuario user = new Usuario();
        user.setNome(dto.getName().trim());
        user.setEmail(dto.getEmail().trim().toLowerCase());
        user.setSenha(passwordEncoder.encode(dto.getPassword()));
        return userService.createUsuario(user);
    }

    /**
     * Retorna os dados do perfil do usuário logado (extraído diretamente do token JWT)
     */
    @GetMapping("/profile")
    public ProfileDTOResponse getMyProfile(Authentication authentication) {
        String email = requireAuthenticatedEmail(authentication);
        return userService.getProfileByEmail(email);
    }

    /**
     * Atualiza os dados do perfil do usuário logado
     */
    @PutMapping("/profile")
    public ProfileDTOResponse updateMyProfile(Authentication authentication, @RequestBody UpdateProfileDTORequest dto) {
        String email = requireAuthenticatedEmail(authentication);
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
     * Atualiza o perfil por ID (somente o próprio usuário autenticado)
     */
    @PutMapping("/{id}")
    public ProfileDTOResponse updateProfileById(
            @PathVariable int id,
            @RequestBody UpdateProfileDTORequest dto,
            Authentication authentication) {
        String email = requireAuthenticatedEmail(authentication);
        ProfileDTOResponse me = userService.getProfileByEmail(email);
        if (me.id != id) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sem permissão para editar o perfil de outro usuário");
        }
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
     * Deleta o próprio usuário autenticado
     */
    @DeleteMapping("/{id}")
    public boolean deleteUser(@PathVariable int id, Authentication authentication) {
        String email = requireAuthenticatedEmail(authentication);
        ProfileDTOResponse me = userService.getProfileByEmail(email);
        if (me.id != id) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sem permissão para excluir outro usuário");
        }
        return userService.deleteUsuario(id);
    }
}
