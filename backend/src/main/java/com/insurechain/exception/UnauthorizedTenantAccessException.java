package com.insurechain.exception;

public class UnauthorizedTenantAccessException extends RuntimeException {
    public UnauthorizedTenantAccessException(String message) {
        super(message);
    }
}
