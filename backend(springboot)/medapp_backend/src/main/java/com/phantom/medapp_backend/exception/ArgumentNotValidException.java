package com.phantom.medapp_backend.exception;

public class ArgumentNotValidException extends RuntimeException{

    public ArgumentNotValidException(String message) {
        super(message);
    }
}
