package com.phantom.medapp_backend.auth.dto;

public record AuthResponse(
        String token,
        String email,
        String role,
        String firstName,
        String lastName) {

}
