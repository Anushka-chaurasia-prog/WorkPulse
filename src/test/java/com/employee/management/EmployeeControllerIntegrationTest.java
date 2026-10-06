package com.employee.management;

import com.employee.management.dto.EmployeeRequest;
import com.employee.management.entity.Department;
import com.employee.management.entity.Employee;
import com.employee.management.repository.DepartmentRepository;
import com.employee.management.repository.EmployeeRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@WithMockUser(username = "test_admin", roles = {"USER"})
class EmployeeControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    private Department savedDepartment;

    @BeforeEach
    void setUp() {
        savedDepartment = departmentRepository.saveAndFlush(new Department("Engineering_" + UUID.randomUUID().toString().substring(0, 8)));
    }

    @Test
    @DisplayName("1. Create employee successfully - 201 Created")
    void shouldCreateEmployeeSuccessfully() throws Exception {
        EmployeeRequest request = new EmployeeRequest(
                "John",
                "Doe",
                "john.doe." + UUID.randomUUID().toString().substring(0, 6) + "@company.com",
                "+1-234-567-8901",
                new BigDecimal("85000.00"),
                LocalDate.of(2023, 1, 15),
                savedDepartment.getId()
        );

        mockMvc.perform(post("/api/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.firstName", is("John")))
                .andExpect(jsonPath("$.lastName", is("Doe")))
                .andExpect(jsonPath("$.email", is(request.email())))
                .andExpect(jsonPath("$.salary", is(85000.00)))
                .andExpect(jsonPath("$.departmentId", is(savedDepartment.getId().toString())))
                .andExpect(jsonPath("$.departmentName", is(savedDepartment.getName())))
                .andExpect(jsonPath("$.createdAt", notNullValue()));
    }

    @Test
    @DisplayName("2. Get employee by ID - 200 OK")
    void shouldGetEmployeeById() throws Exception {
        String email = "sarah.connor." + UUID.randomUUID().toString().substring(0, 6) + "@cyberdyne.com";
        Employee saved = employeeRepository.saveAndFlush(new Employee(
                "Sarah", "Connor", email, "555-9000", new BigDecimal("95000.00"), LocalDate.of(2022, 5, 20), savedDepartment
        ));

        mockMvc.perform(get("/api/employees/{id}", saved.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(saved.getId().toString())))
                .andExpect(jsonPath("$.firstName", is("Sarah")))
                .andExpect(jsonPath("$.email", is(email)))
                .andExpect(jsonPath("$.departmentName", is(savedDepartment.getName())));
    }

    @Test
    @DisplayName("3. Get paginated employees - 200 OK")
    void shouldGetPaginatedEmployees() throws Exception {
        for (int i = 0; i < 5; i++) {
            employeeRepository.saveAndFlush(new Employee(
                    "User" + i, "Test", "user" + i + "." + UUID.randomUUID().toString().substring(0, 6) + "@test.com",
                    "123", new BigDecimal("50000"), LocalDate.now(), savedDepartment
            ));
        }

        mockMvc.perform(get("/api/employees")
                        .param("page", "0")
                        .param("size", "3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page", is(0)))
                .andExpect(jsonPath("$.size", is(3)))
                .andExpect(jsonPath("$.content", hasSize(3)))
                .andExpect(jsonPath("$.totalElements", greaterThanOrEqualTo(5)))
                .andExpect(jsonPath("$.totalPages", greaterThanOrEqualTo(2)));
    }

    @Test
    @DisplayName("4. Search employees by name or email - 200 OK")
    void shouldSearchEmployees() throws Exception {
        String uniqueMarker = UUID.randomUUID().toString().substring(0, 8);
        employeeRepository.saveAndFlush(new Employee(
                "Alexander", "Hamilton", "alex." + uniqueMarker + "@treasury.gov",
                "111", new BigDecimal("100000"), LocalDate.now(), savedDepartment
        ));
        employeeRepository.saveAndFlush(new Employee(
                "Aaron", "Burr", "aaron." + uniqueMarker + "@senate.gov",
                "222", new BigDecimal("90000"), LocalDate.now(), savedDepartment
        ));

        mockMvc.perform(get("/api/employees")
                        .param("search", "Hamilton")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].lastName", is("Hamilton")))
                .andExpect(jsonPath("$.content[0].firstName", is("Alexander")));

        mockMvc.perform(get("/api/employees")
                        .param("search", uniqueMarker)
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)));
    }

    @Test
    @DisplayName("5. Update employee successfully - 200 OK")
    void shouldUpdateEmployeeSuccessfully() throws Exception {
        Department newDept = departmentRepository.saveAndFlush(new Department("Operations_" + UUID.randomUUID().toString().substring(0, 6)));
        String initialEmail = "dev." + UUID.randomUUID().toString().substring(0, 6) + "@domain.com";

        Employee saved = employeeRepository.saveAndFlush(new Employee(
                "Initial", "Name", initialEmail, "000", new BigDecimal("60000"), LocalDate.now(), savedDepartment
        ));

        String updatedEmail = "updated." + UUID.randomUUID().toString().substring(0, 6) + "@domain.com";
        EmployeeRequest updateRequest = new EmployeeRequest(
                "UpdatedFirst",
                "UpdatedLast",
                updatedEmail,
                "+1-999-888-7777",
                new BigDecimal("75000.00"),
                LocalDate.of(2023, 6, 1),
                newDept.getId()
        );

        mockMvc.perform(put("/api/employees/{id}", saved.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(saved.getId().toString())))
                .andExpect(jsonPath("$.firstName", is("UpdatedFirst")))
                .andExpect(jsonPath("$.lastName", is("UpdatedLast")))
                .andExpect(jsonPath("$.email", is(updatedEmail)))
                .andExpect(jsonPath("$.salary", is(75000.00)))
                .andExpect(jsonPath("$.departmentId", is(newDept.getId().toString())))
                .andExpect(jsonPath("$.departmentName", is(newDept.getName())));
    }

    @Test
    @DisplayName("6. Delete employee - 204 No Content")
    void shouldDeleteEmployeeSuccessfully() throws Exception {
        Employee saved = employeeRepository.saveAndFlush(new Employee(
                "To", "Delete", "delete." + UUID.randomUUID().toString().substring(0, 6) + "@domain.com",
                "000", new BigDecimal("50000"), LocalDate.now(), savedDepartment
        ));

        mockMvc.perform(delete("/api/employees/{id}", saved.getId()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/employees/{id}", saved.getId()))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("7. Reject duplicate employee email - 409 Conflict")
    void shouldRejectDuplicateEmail() throws Exception {
        String existingEmail = "existing." + UUID.randomUUID().toString().substring(0, 6) + "@domain.com";
        employeeRepository.saveAndFlush(new Employee(
                "First", "User", existingEmail, "123", new BigDecimal("50000"), LocalDate.now(), savedDepartment
        ));

        EmployeeRequest duplicateRequest = new EmployeeRequest(
                "Second", "User", existingEmail, "456", new BigDecimal("60000"), LocalDate.now(), savedDepartment.getId()
        );

        mockMvc.perform(post("/api/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicateRequest)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status", is(409)))
                .andExpect(jsonPath("$.error", is("CONFLICT")));
    }

    @Test
    @DisplayName("8. Reject non-existing department - 404 Not Found")
    void shouldRejectNonExistingDepartment() throws Exception {
        UUID nonExistingDeptId = UUID.randomUUID();
        EmployeeRequest request = new EmployeeRequest(
                "Valid", "Employee", "valid." + UUID.randomUUID().toString().substring(0, 6) + "@domain.com",
                "123", new BigDecimal("50000"), LocalDate.now(), nonExistingDeptId
        );

        mockMvc.perform(post("/api/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.error", is("NOT_FOUND")));
    }

    @Test
    @DisplayName("9. Return 404 for missing employee")
    void shouldReturn404ForMissingEmployee() throws Exception {
        UUID nonExistingId = UUID.randomUUID();

        mockMvc.perform(get("/api/employees/{id}", nonExistingId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.error", is("NOT_FOUND")));
    }

    @Test
    @DisplayName("10. Validation: Reject invalid request data (missing fields, bad email, negative salary)")
    void shouldRejectInvalidEmployeeData() throws Exception {
        // Missing firstName, invalid email format, negative salary, missing departmentId
        EmployeeRequest invalidRequest = new EmployeeRequest(
                "",
                "LastName",
                "not-an-email",
                "123",
                new BigDecimal("-500.00"),
                null,
                null
        );

        mockMvc.perform(post("/api/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.error", is("BAD_REQUEST")))
                .andExpect(jsonPath("$.validationErrors.firstName", notNullValue()))
                .andExpect(jsonPath("$.validationErrors.email", notNullValue()))
                .andExpect(jsonPath("$.validationErrors.salary", notNullValue()))
                .andExpect(jsonPath("$.validationErrors.joiningDate", notNullValue()))
                .andExpect(jsonPath("$.validationErrors.departmentId", notNullValue()));
    }

    @Test
    @DisplayName("11. Hardening: Normalize out-of-bounds page and size gracefully")
    void shouldNormalizeOutOfBoundsPageAndSize() throws Exception {
        mockMvc.perform(get("/api/employees")
                        .param("page", "-5")
                        .param("size", "500"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page", is(0)))
                .andExpect(jsonPath("$.size", is(100)));
    }

    @Test
    @DisplayName("12. Hardening: Sort employees by valid field (salary,asc)")
    void shouldSortEmployeesByValidField() throws Exception {
        mockMvc.perform(get("/api/employees")
                        .param("sort", "salary,asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page", is(0)));
    }

    @Test
    @DisplayName("13. Hardening: Fallback safely on unsupported sort field name")
    void shouldFallbackSafelyOnInvalidSortField() throws Exception {
        mockMvc.perform(get("/api/employees")
                        .param("sort", "malicious_field_injection,asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page", is(0)));
    }
}
