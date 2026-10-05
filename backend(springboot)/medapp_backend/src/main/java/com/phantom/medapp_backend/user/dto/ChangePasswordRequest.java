package com.phantom.medapp_backend.user.dto;

import com.phantom.medapp_backend.utils.NotBlankIfPresent;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChangePasswordRequest {

    @NotBlankIfPresent(message = "Current password is required")
    private String currentPassword;

    @NotBlankIfPresent(message = "New password is required")
    @Size(min = 8, message = "Password must contain at least 8 characters")
    private String newPassword;

    @NotBlankIfPresent(message = "Password confirmation is required")
    private String confirmPassword;
}