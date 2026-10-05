package com.phantom.medapp_backend.config;

import java.util.UUID;



public class PasswordGenerator {

    public static String generateTemporaryPassword()  {
        return UUID.randomUUID()
        .toString()
        .substring(0, 12);
    }
}
