package com.smallsteps.smallsteps.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.smallsteps.smallsteps.dto.ProfileDTOResponse;
import com.smallsteps.smallsteps.dto.UpdateProfileDTORequest;
import com.smallsteps.smallsteps.entity.Tag;
import com.smallsteps.smallsteps.entity.Usuario;
import com.smallsteps.smallsteps.repository.GoalRepository;
import com.smallsteps.smallsteps.repository.TagRepository;
import com.smallsteps.smallsteps.repository.TagUsuarioRepository;
import com.smallsteps.smallsteps.repository.UserRepository;
import com.smallsteps.smallsteps.service.UserService;

@ExtendWith(MockitoExtension.class)
public class UserControllerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private GoalRepository goalRepository;

    @Mock
    private TagRepository tagRepository;

    @Mock
    private TagUsuarioRepository tagUsuarioRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private UserService userService;
    private UserController userController;
    private Usuario usuarioTeste;
    private Authentication authentication;

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository, goalRepository, tagRepository, tagUsuarioRepository);
        userController = new UserController(userService, passwordEncoder);

        usuarioTeste = new Usuario();
        usuarioTeste.setId(1);
        usuarioTeste.setNome("Lagarto Voador");
        usuarioTeste.setEmail("teste@email.com");
        usuarioTeste.setDescricao("Bio de teste");
        usuarioTeste.setStreakNum(127);

        authentication = new TestingAuthenticationToken("teste@email.com", "password", "read");
    }

    @Test
    @DisplayName("GET /users/profile deve retornar perfil do usuario autenticado")
    void deveRetornarPerfilUsuarioLogado() {
        when(userRepository.findByEmail("teste@email.com")).thenReturn(Optional.of(usuarioTeste));

        ProfileDTOResponse response = userController.getMyProfile(authentication);

        assertNotNull(response);
        assertEquals("Lagarto Voador", response.name);
        assertEquals(127, response.streakCount);
    }

    @Test
    @DisplayName("PUT /users/profile deve atualizar perfil do usuario autenticado")
    void deveAtualizarPerfilUsuarioLogado() {
        when(userRepository.findByEmail("teste@email.com")).thenReturn(Optional.of(usuarioTeste));
        when(userRepository.save(any(Usuario.class))).thenReturn(usuarioTeste);

        UpdateProfileDTORequest request = new UpdateProfileDTORequest();
        request.name = "Novo Nome";

        ProfileDTOResponse response = userController.updateMyProfile(authentication, request);

        assertNotNull(response);
        assertEquals("Novo Nome", usuarioTeste.getNome());
    }

    @Test
    @DisplayName("GET /users/{id} deve retornar perfil por ID")
    void deveRetornarPerfilPorId() {
        when(userRepository.findById(1)).thenReturn(Optional.of(usuarioTeste));

        ProfileDTOResponse response = userController.getProfileById(1);

        assertNotNull(response);
        assertEquals(1, response.id);
        assertEquals("Lagarto Voador", response.name);
    }

    @Test
    @DisplayName("GET /users/tags deve retornar tags cadastradas")
    void deveRetornarTags() {
        when(tagRepository.findAllByOrderByDescricaoAsc()).thenReturn(List.of(
                new Tag(1, "Piano"),
                new Tag(2, "Leitura"),
                new Tag(3, "Saude")
        ));

        List<String> tags = userController.getTags();

        assertEquals(3, tags.size());
        assertTrue(tags.contains("Piano"));
    }
}
