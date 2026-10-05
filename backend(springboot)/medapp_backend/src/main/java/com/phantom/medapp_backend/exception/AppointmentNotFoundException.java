package com.phantom.medapp_backend.exception;

public class AppointmentNotFoundException extends RuntimeException {
        public AppointmentNotFoundException(String message) {
        super(message);
    }
}
