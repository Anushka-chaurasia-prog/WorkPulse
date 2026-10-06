package com.employee.management.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record DepartmentResponse(
        UUID id,
        String name,
        long employeeCount,
        LocalDateTime createdAt
) {
}
