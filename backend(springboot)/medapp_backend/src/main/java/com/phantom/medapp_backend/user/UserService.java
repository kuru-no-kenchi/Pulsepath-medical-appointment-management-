package com.phantom.medapp_backend.user;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.phantom.medapp_backend.exception.UserNotFoundException;
import com.phantom.medapp_backend.user.dto.ChangePasswordRequest;
import com.phantom.medapp_backend.user.dto.ResetPasswordRequest;
import com.phantom.medapp_backend.user.dto.UserResponse;
import com.phantom.medapp_backend.auditlog.AuditLogAction;
import com.phantom.medapp_backend.auditlog.AuditLogService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final AuditLogService auditLogService;

    public User getUserFromAuthentication(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findUserByEmail(email).orElseThrow(() -> new UserNotFoundException("User Not Found"));
        return user;
    }

    public UserResponse getCurrentUser(
            Authentication authentication
    ) {
        String email = authentication.getName();

        User user = userRepository
                .findUserByEmail(email)
                .orElseThrow(()
                        -> new UserNotFoundException("User not found")
                );

        return userMapper.map(user);
    }

    @Transactional
    public void changePassword(
            User user,
            ChangePasswordRequest request
    ) {
        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                user.getPassword()
        )) {
            throw new IllegalArgumentException(
                    "Current password is incorrect"
            );
        }
        if (!request.getNewPassword().equals(
                request.getConfirmPassword()
        )) {
            throw new IllegalArgumentException(
                    "Passwords do not match"
            );
        }
        if (passwordEncoder.matches(
                request.getNewPassword(),
                user.getPassword()
        )) {
            throw new IllegalArgumentException(
                    "New password must be different from current password"
            );
        }
        user.setPassword(
                passwordEncoder.encode(request.getNewPassword())
        );
        userRepository.save(user);
        auditLogService.log(
                user,
                AuditLogAction.PASSWORD_CHANGE,
                "User",
                user.getId(),
                user.getFullName() + "updated the password"
        );
    }

    @Transactional
    public ResponseEntity<Void> resetPassword(ResetPasswordRequest request) {

        User user = userRepository
                .findUserByEmail(request.getEmail())
                .orElseThrow(()
                        -> new UserNotFoundException("User not found")
                );

        user.setPassword(
                passwordEncoder.encode(request.getNewPassword())
        );

        userRepository.save(user);
        return ResponseEntity.ok(null);
    }
}
