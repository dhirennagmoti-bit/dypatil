package com.insurechain.exception;

public class InvalidWorkflowTransitionException extends RuntimeException {
    public InvalidWorkflowTransitionException(String message) {
        super(message);
    }
}
