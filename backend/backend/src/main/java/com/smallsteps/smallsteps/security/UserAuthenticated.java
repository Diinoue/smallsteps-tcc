package com.smallsteps.smallsteps.security;

import java.util.Collection;
import java.util.List;

// import org.jspecify.annotation.Nullable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

// import com.smallsteps.smallsteps.entity.User;
import com.smallsteps.smallsteps.entity.Usuario;

public class UserAuthenticated implements UserDetails{
    private final Usuario usuario;

    public UserAuthenticated(Usuario usuario) {
            this.usuario = usuario;
        }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(() -> "read");
    }

    @Override
    public /* @Nullable*/ String getPassword() {
        return usuario.getSenha();
    }

    @Override
    public String getUsername() {
        return usuario.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired () {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
