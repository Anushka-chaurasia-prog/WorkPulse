package com.employee.management;

import com.employee.management.dto.DepartmentRequest;
import com.employee.management.entity.Department;
import com.employee.management.entity.Employee;
import com.employee.management.repository.DepartmentRepository;
import com.employee.management.repository.EmployeeRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
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
class DepartmentControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Test
    @DisplayName("1. Create department successfully - 201 Created")
    void shouldCreateDepartmentSuccessfully() throws Exception {
        DepartmentRequest request = new DepartmentRequest("Information Technology");

        mockMvc.perform(post("/api/departments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.name", is("Information Technology")))
                .andExpect(jsonPath("$.employeeCount", is(0)))
                .andExpect(jsonPath("$.createdAt", notNullValue()));
    }

    @Test
    @DisplayName("2. Get all departments - 200 OK")
    void shouldGetAllDepartments() throws Exception {
        departmentRepository.saveAndFlush(new Department("Quality Assurance"));
        departmentRepository.saveAndFlush(new Department("Legal"));

        mockMvc.perform(get("/api/departments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(2))));
    }

    @Test
    @DisplayName("3. Get department by ID - 200 OK")
    void shouldGetDepartmentById() throws Exception {
        Department saved = departmentRepository.saveAndFlush(new Department("Customer Support"));

        mockMvc.perform(get("/api/departments/{id}", saved.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(saved.getId().toString())))
                .andExpect(jsonPath("$.name", is("Customer Support")));
    }

    @Test
    @DisplayName("4. Update department successfully - 200 OK")
    void shouldUpdateDepartmentSuccessfully() throws Exception {
        Department saved = departmentRepository.saveAndFlush(new Department("Old Department Name"));
        DepartmentRequest updateRequest = new DepartmentRequest("New Department Name");

        mockMvc.perform(put("/api/departments/{id}", saved.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(saved.getId().toString())))
                .andExpect(jsonPath("$.name", is("New Department Name")));
    }

    @Test
    @DisplayName("5. Delete empty department - 204 No Content")
    void shouldDeleteEmptyDepartment() throws Exception {
        Department saved = departmentRepository.saveAndFlush(new Department("Temporary Department"));

        mockMvc.perform(delete("/api/departments/{id}", saved.getId()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/departments/{id}", saved.getId()))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("6. Reject duplicate department name - 409 Conflict")
    void shouldRejectDuplicateDepartmentName() throws Exception {
        departmentRepository.saveAndFlush(new Department("Finance"));

        DepartmentRequest duplicateRequest = new DepartmentRequest("Finance");

        mockMvc.perform(post("/api/departments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicateRequest)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status", is(409)))
                .andExpect(jsonPath("$.error", is("CONFLICT")));
    }

    @Test
    @DisplayName("7. Return 404 for missing department")
    void shouldReturn404ForMissingDepartment() throws Exception {
        UUID nonExistingId = UUID.randomUUID();

        mockMvc.perform(get("/api/departments/{id}", nonExistingId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.error", is("NOT_FOUND")));
    }

    @Test
    @DisplayName("8. Reject deletion when employees belong to department - 409 Conflict")
    void shouldRejectDepartmentDeletionWhenEmployeesExist() throws Exception {
        Department dept = departmentRepository.saveAndFlush(new Department("Engineering Division"));
        Employee emp = new Employee("Jane", "Doe", "jane.doe@workpulse.io", "555-1234", new BigDecimal("90000"), LocalDate.now(), dept);
        employeeRepository.saveAndFlush(emp);

        mockMvc.perform(delete("/api/departments/{id}", dept.getId()))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status", is(409)))
                .andExpect(jsonPath("$.error", is("CONFLICT")));
    }

    @Test
    @DisplayName("Validation: Reject blank department name - 400 Bad Request")
    void shouldRejectBlankDepartmentName() throws Exception {
        DepartmentRequest blankRequest = new DepartmentRequest("   ");

        mockMvc.perform(post("/api/departments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(blankRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.error", is("BAD_REQUEST")))
                .andExpect(jsonPath("$.validationErrors.name", notNullValue()));
    }
}
