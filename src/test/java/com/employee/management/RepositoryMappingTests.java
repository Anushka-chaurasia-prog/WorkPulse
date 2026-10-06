package com.employee.management;

import com.employee.management.entity.Department;
import com.employee.management.entity.Employee;
import com.employee.management.entity.User;
import com.employee.management.repository.DepartmentRepository;
import com.employee.management.repository.EmployeeRepository;
import com.employee.management.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@Transactional
class RepositoryMappingTests {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Test
    @DisplayName("Should persist and find a Department with auto-generated UUID and createdAt timestamp")
    void shouldPersistAndFindDepartment() {
        Department department = new Department("Engineering");
        Department saved = departmentRepository.saveAndFlush(department);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getName()).isEqualTo("Engineering");
        assertThat(saved.getCreatedAt()).isNotNull();

        Optional<Department> found = departmentRepository.findByName("Engineering");
        assertThat(found).isPresent();
        assertThat(found.get().getId()).isEqualTo(saved.getId());
    }

    @Test
    @DisplayName("Should persist and find an Employee with BigDecimal salary, LocalDate, and auto-generated UUID")
    void shouldPersistAndFindEmployee() {
        Department department = departmentRepository.saveAndFlush(new Department("Product"));

        Employee employee = new Employee(
                "Alice",
                "Smith",
                "alice.smith@example.com",
                "+1-555-0199",
                new BigDecimal("95000.00"),
                LocalDate.of(2024, 2, 1),
                department
        );
        Employee saved = employeeRepository.saveAndFlush(employee);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getFirstName()).isEqualTo("Alice");
        assertThat(saved.getLastName()).isEqualTo("Smith");
        assertThat(saved.getEmail()).isEqualTo("alice.smith@example.com");
        assertThat(saved.getPhone()).isEqualTo("+1-555-0199");
        assertThat(saved.getSalary()).isEqualByComparingTo(new BigDecimal("95000.00"));
        assertThat(saved.getJoiningDate()).isEqualTo(LocalDate.of(2024, 2, 1));
        assertThat(saved.getCreatedAt()).isNotNull();

        Optional<Employee> found = employeeRepository.findByEmail("alice.smith@example.com");
        assertThat(found).isPresent();
        assertThat(found.get().getId()).isEqualTo(saved.getId());
    }

    @Test
    @DisplayName("Should correctly manage Employee -> Department relationship")
    void shouldManageEmployeeDepartmentRelationship() {
        Department department = departmentRepository.saveAndFlush(new Department("Human Resources"));

        Employee emp1 = new Employee("Bob", "Jones", "bob.jones@example.com", "123456", new BigDecimal("70000.00"), LocalDate.now(), department);
        Employee emp2 = new Employee("Charlie", "Brown", "charlie.brown@example.com", "654321", new BigDecimal("75000.00"), LocalDate.now(), department);

        Employee saved1 = employeeRepository.saveAndFlush(emp1);
        Employee saved2 = employeeRepository.saveAndFlush(emp2);

        assertThat(saved1.getDepartment()).isNotNull();
        assertThat(saved1.getDepartment().getId()).isEqualTo(department.getId());
        assertThat(saved1.getDepartment().getName()).isEqualTo("Human Resources");

        assertThat(saved2.getDepartment()).isNotNull();
        assertThat(saved2.getDepartment().getId()).isEqualTo(department.getId());
    }

    @Test
    @DisplayName("Should persist and find a User with default role 'USER' and createdAt timestamp")
    void shouldPersistAndFindUser() {
        User user = new User("johndoe", "john.doe@company.com", "hashedPassword123", null);
        User saved = userRepository.saveAndFlush(user);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getUsername()).isEqualTo("johndoe");
        assertThat(saved.getEmail()).isEqualTo("john.doe@company.com");
        assertThat(saved.getRole()).isEqualTo("USER");
        assertThat(saved.getCreatedAt()).isNotNull();

        Optional<User> byUsername = userRepository.findByUsername("johndoe");
        assertThat(byUsername).isPresent();
        assertThat(byUsername.get().getEmail()).isEqualTo("john.doe@company.com");

        Optional<User> byEmail = userRepository.findByEmail("john.doe@company.com");
        assertThat(byEmail).isPresent();
        assertThat(byEmail.get().getUsername()).isEqualTo("johndoe");
    }

    @Test
    @DisplayName("Should enforce unique constraints on Department name")
    void shouldEnforceUniqueConstraintOnDepartmentName() {
        departmentRepository.saveAndFlush(new Department("Finance"));

        Department duplicateDept = new Department("Finance");
        assertThrows(DataIntegrityViolationException.class, () -> {
            departmentRepository.saveAndFlush(duplicateDept);
        });
    }

    @Test
    @DisplayName("Should enforce unique constraints on Employee email")
    void shouldEnforceUniqueConstraintOnEmployeeEmail() {
        Department dept = departmentRepository.saveAndFlush(new Department("Operations"));

        Employee emp1 = new Employee("David", "Miller", "duplicate.email@example.com", "111", new BigDecimal("60000.00"), LocalDate.now(), dept);
        employeeRepository.saveAndFlush(emp1);

        Employee emp2 = new Employee("Daniel", "Miller", "duplicate.email@example.com", "222", new BigDecimal("62000.00"), LocalDate.now(), dept);
        assertThrows(DataIntegrityViolationException.class, () -> {
            employeeRepository.saveAndFlush(emp2);
        });
    }

    @Test
    @DisplayName("Should enforce unique constraints on User username and email")
    void shouldEnforceUniqueConstraintOnUser() {
        userRepository.saveAndFlush(new User("unique_user", "unique_email@example.com", "pass1", "USER"));

        User duplicateUsername = new User("unique_user", "another_email@example.com", "pass2", "USER");
        assertThrows(DataIntegrityViolationException.class, () -> {
            userRepository.saveAndFlush(duplicateUsername);
        });
    }
}
