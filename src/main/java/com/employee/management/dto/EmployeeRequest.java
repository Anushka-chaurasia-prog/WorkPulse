package com.employee.management.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record EmployeeRequest(
        @NotBlank(message = "First name is required")
        @Size(max = 50, message = "First name cannot exceed 50 characters")
        String firstName,

        @NotBlank(message = "Last name is required")
        @Size(max = 50, message = "Last name cannot exceed 50 characters")
        String lastName,

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be a valid email address")
        @Size(max = 100, message = "Email cannot exceed 100 characters")
        String email,

        @Size(max = 20, message = "Phone number cannot exceed 20 characters")
        String phone,

        @PositiveOrZero(message = "Salary must not be negative")
        BigDecimal salary,

        @NotNull(message = "Joining date is required")
        LocalDate joiningDate,

        @NotNull(message = "Department ID is required")
        UUID departmentId
) {
}
