package com.smallsteps.smallsteps.security;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.smallsteps.smallsteps.entity.Usuario;
import com.smallsteps.smallsteps.repository.UserRepository;

@Service
public class AuthenticatedUserService {

    private final UserRepository userRepository;

    public AuthenticatedUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public String getCurrentUserEmail(Authentication authentication) {
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

    public Usuario getCurrentUser(Authentication authentication) {
        String email = getCurrentUserEmail(authentication);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Sessão inválida: usuário não encontrado"));
    }

    public int getCurrentUserId(Authentication authentication) {
        return getCurrentUser(authentication).getId();
    }
}
