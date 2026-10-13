package com.smallsteps.smallsteps.service;

import java.util.ArrayList;
import java.util.List;

import com.smallsteps.smallsteps.entity.Usuario;

public class UserService {

    public List<Usuario> readUsuario() {
        List<Usuario> lista = new ArrayList<>();
        return lista;
    }

    public Usuario createUsuario(Usuario user) {
        return new Usuario();
    }

    public Usuario updateUsuario(Usuario user) {
        return new Usuario();
    }

    public boolean deleteUsuario(int id) {
        return true;
    }

}
