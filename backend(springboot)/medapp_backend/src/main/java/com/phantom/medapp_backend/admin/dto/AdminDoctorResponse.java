package com.phantom.medapp_backend.admin.dto;

import java.util.UUID;


public record AdminDoctorResponse(
    UUID doctor_id,
    String email,
    String temporarypassword
) {

}
