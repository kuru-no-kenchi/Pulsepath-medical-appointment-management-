package com.phantom.medapp_backend.auth;

import jakarta.validation.constraints.NotBlank;

public class RegisterRequest {

    @NotBlank
    public String firstName;
    @NotBlank
    public String lastName;
    @NotBlank
    public String email;
    @NotBlank
    public String password;
    @NotBlank
    public String phone;
    
}
