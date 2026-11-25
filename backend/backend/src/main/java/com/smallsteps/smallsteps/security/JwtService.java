package com.smallsteps.smallsteps.security;

import java.time.Instant;
import java.util.stream.Collectors;

import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

@Service 
public class JwtService {
    private final JwtEncoder encoder;

    public JwtService(JwtEncoder encoder) {
        this.encoder = encoder;
    }

    public String generateToken (Authentication authentication) {
        Instant now = Instant.now();
        long expiry = 86400L; // 24 horas

        String scopes = authentication.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .collect(Collectors.joining(" "));

        var claimsBuilder = JwtClaimsSet.builder()
            .issuer("smallsteps")
            .issuedAt(now)
            .expiresAt(now.plusSeconds(expiry))
            .subject(authentication.getName())
            .claim("scope", scopes);

        if (authentication.getPrincipal() instanceof UserAuthenticated userAuth) {
            claimsBuilder.claim("userId", userAuth.getId());
        }

        var claims = claimsBuilder.build();

        return encoder.encode(
            JwtEncoderParameters.from(claims))
            .getTokenValue();
    }
}