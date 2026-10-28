package com.smallsteps.smallsteps.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smallsteps.smallsteps.entity.Usuario;

public interface UserRepository extends JpaRepository<Usuario, Integer>{
    //acho que aqui a gnt precisa implementar uma consulta para as goals e subgoals do usuario
        Optional<Usuario> findByNome(String nome);
        Optional<Usuario> findByEmail(String email);
}