package com.example.casa_legal_hub_management_system.security;

import com.example.casa_legal_hub_management_system.model.User;
import com.example.casa_legal_hub_management_system.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("No account found for: " + email));

        if ("Inactive".equals(user.getStatus())) {
            throw new UsernameNotFoundException("Your account has been deactivated. Contact the administrator.");
        }
        return new UserPrincipal(user);
    }
}
