package com.phantom.medapp_backend.exception;

public class AssistantNotFoundException extends RuntimeException{

    public AssistantNotFoundException(String message){
        super(message);
    }
}
