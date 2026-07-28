package com.example.community.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCode {
    VALIDATION_ERROR(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "입력값이 올바르지 않습니다."),
    INVALID_REQUEST(HttpStatus.BAD_REQUEST, "INVALID_REQUEST", "요청 형식이 올바르지 않습니다."),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "회원을 찾을 수 없습니다."),
    POST_NOT_FOUND(HttpStatus.NOT_FOUND, "POST_NOT_FOUND", "게시글을 찾을 수 없습니다."),
    COMMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "COMMENT_NOT_FOUND", "댓글을 찾을 수 없습니다."),
    EMAIL_ALREADY_EXISTS(HttpStatus.CONFLICT, "EMAIL_ALREADY_EXISTS", "이미 사용 중인 이메일입니다."),
    INVALID_LOGIN(HttpStatus.UNAUTHORIZED, "INVALID_LOGIN", "이메일 또는 비밀번호가 올바르지 않습니다."),
    CURRENT_PASSWORD_MISMATCH(HttpStatus.FORBIDDEN, "CURRENT_PASSWORD_MISMATCH", "현재 비밀번호가 일치하지 않습니다."),
    FORBIDDEN_ACTION(HttpStatus.FORBIDDEN, "FORBIDDEN_ACTION", "해당 작업을 수행할 권한이 없습니다."),
    ITEM_NOT_FOUND(HttpStatus.NOT_FOUND, "ITEM_NOT_FOUND", "존재하지 않는 아이템입니다."),
    ITEM_ALREADY_PURCHASED(HttpStatus.CONFLICT, "ITEM_ALREADY_PURCHASED", "이미 구매한 아이템입니다."),
    INSUFFICIENT_SUNLIGHT(HttpStatus.BAD_REQUEST, "INSUFFICIENT_SUNLIGHT", "햇빛이 부족합니다."),
    ITEM_NOT_PURCHASED(HttpStatus.BAD_REQUEST, "ITEM_NOT_PURCHASED", "구매한 아이템만 장착할 수 있습니다."),
    ITEM_NOT_EQUIPPED(HttpStatus.BAD_REQUEST, "ITEM_NOT_EQUIPPED", "현재 장착 중인 아이템이 아닙니다."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR", "서버 내부 오류가 발생했습니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;

    ErrorCode(HttpStatus status, String code, String message) {
        this.status = status;
        this.code = code;
        this.message = message;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }
}
