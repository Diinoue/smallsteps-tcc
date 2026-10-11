package com.smallsteps.smallsteps.repository;

import org.springframework.data.jpa.repository.JpaRepository;

// import com.smallsteps.smallsteps.model.User;
import com.smallsteps.smallsteps.entity.User;

public interface UserRepository extends JpaRepository<User, Integer>{
}