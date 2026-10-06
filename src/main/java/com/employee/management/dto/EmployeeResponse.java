package com.employee.management.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record EmployeeResponse(
        UUID id,
        String firstName,
        String lastName,
        String email,
        String phone,
        BigDecimal salary,
        LocalDate joiningDate,
        UUID departmentId,
        String departmentName,
        LocalDateTime createdAt
) {
}
