package com.phantom.medapp_backend.user.dto;

import com.phantom.medapp_backend.utils.NotBlankIfPresent;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResetPasswordRequest {

    @NotBlank
    @Email
    private String email;
    @NotBlankIfPresent
    @Size(min = 8, message = "Password must contain at least 8 characters")
    @Pattern(
            regexp = "^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9\\s]).+$",
            message = "Password must contain an uppercase letter, a number, and a special character"
    )
    private String newPassword;
}