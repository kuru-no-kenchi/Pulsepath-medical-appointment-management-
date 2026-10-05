package com.phantom.medapp_backend.exception.dto;

import java.time.LocalDateTime;


public record ErrorResponse(

    LocalDateTime timestamp,
    int status,
    String error,
    String message
) {

}
