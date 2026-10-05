package com.phantom.medapp_backend.exception;

public class MissingCredentialsException extends  RuntimeException{

    public MissingCredentialsException(String message){
        super(message);
    }
}
