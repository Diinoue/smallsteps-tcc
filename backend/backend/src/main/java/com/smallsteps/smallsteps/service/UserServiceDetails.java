package com.smallsteps.smallsteps.service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

public interface UserServiceDetails extends UserDetailsService {
    UserDetails loadUserByUsername(String name) throws UsernameNotFoundException;
}