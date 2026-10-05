package com.phantom.medapp_backend.user.dto;

import com.phantom.medapp_backend.user.Role;

public record UserResponse(
    String firstName,
    String lastName,
    String email,
    String phone,
    String photoUrl,
    Role role
) {

}
