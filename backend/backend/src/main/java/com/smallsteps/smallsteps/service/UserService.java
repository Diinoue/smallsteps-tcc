package com.smallsteps.smallsteps.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

// import com.smallsteps.smallsteps.entity.User;
import com.smallsteps.smallsteps.model.User;
import com.smallsteps.smallsteps.repository.UserRepository;

@Service 
public class UserService {
    
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

public List<User> readUsuario() {
    List<User> lista = new ArrayList<User>();


    return lista;
}

// so esse funciona
public User createUsuario(User user) { return userRepository.save(user); }

public User updateUsuario(User user) {


    return new User();
}

public boolean deleteUsuario(int id) {


    return true;
}

}
