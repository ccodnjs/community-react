package com.example.community.exception;

public class CommunityException extends RuntimeException {

    private final ErrorCode errorCode;

    public CommunityException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public ErrorCode getErrorCode() {
        return errorCode;
    }
}
