package com.phantom.medapp_backend.user;

import org.springframework.stereotype.Component;

import com.phantom.medapp_backend.user.dto.UserResponse;

@Component
public class UserMapper {

    public UserResponse map(User user){
        return new UserResponse(
            user.getFirstName(),
            user.getLastName(),
            user.getEmail(),
            user.getPhone(),
            user.getPhotoUrl(),
            user.getRole()
        );
    }
}
