package com.phantom.medapp_backend.user.dto;

import com.phantom.medapp_backend.utils.NotBlankIfPresent;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserRequest {

    @NotBlankIfPresent
    private String firstName;

    @NotBlankIfPresent
    private String lastName;

    @Email(message = "Invalid email")
    private String email;

    @NotBlankIfPresent
    @Pattern(
            regexp = "^0[5-7][0-9]{8}$",
            message = "Invalid phone number"
    )
    private String phone;
    private String photoUrl;
}
