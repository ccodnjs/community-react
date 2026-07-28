package com.example.community.dto.response;

import java.util.Map;

public record ApiErrorResponse(
        String code,
        String message,
        int status,
        Map<String, String> fieldErrors
) {
}
