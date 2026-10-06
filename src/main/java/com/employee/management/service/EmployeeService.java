package com.employee.management.service;

import com.employee.management.dto.EmployeeRequest;
import com.employee.management.dto.EmployeeResponse;
import com.employee.management.dto.PagedResponse;
import com.employee.management.entity.Department;
import com.employee.management.entity.Employee;
import com.employee.management.exception.DuplicateResourceException;
import com.employee.management.exception.ResourceNotFoundException;
import com.employee.management.repository.DepartmentRepository;
import com.employee.management.repository.EmployeeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;

    public EmployeeService(EmployeeRepository employeeRepository, DepartmentRepository departmentRepository) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
    }

    @Transactional
    public EmployeeResponse createEmployee(EmployeeRequest request) {
        String trimmedEmail = request.email().trim();
        if (employeeRepository.existsByEmailIgnoreCase(trimmedEmail)) {
            throw new DuplicateResourceException("Employee with email '" + trimmedEmail + "' already exists.");
        }

        Department department = departmentRepository.findById(request.departmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + request.departmentId()));

        Employee employee = new Employee(
                request.firstName().trim(),
                request.lastName().trim(),
                trimmedEmail,
                request.phone() != null ? request.phone().trim() : null,
                request.salary(),
                request.joiningDate(),
                department
        );

        Employee savedEmployee = employeeRepository.save(employee);
        return mapToResponse(savedEmployee);
    }

    public PagedResponse<EmployeeResponse> getAllEmployees(String search, Pageable pageable) {
        Page<Employee> employeePage;
        if (search != null && !search.trim().isEmpty()) {
            employeePage = employeeRepository.searchEmployees(search.trim(), pageable);
        } else {
            employeePage = employeeRepository.findAllWithDepartment(pageable);
        }

        Page<EmployeeResponse> responsePage = employeePage.map(this::mapToResponse);
        return PagedResponse.from(responsePage);
    }

    public EmployeeResponse getEmployeeById(UUID id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + id));

        return mapToResponse(employee);
    }

    @Transactional
    public EmployeeResponse updateEmployee(UUID id, EmployeeRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + id));

        String trimmedEmail = request.email().trim();
        if (employeeRepository.existsByEmailIgnoreCaseAndIdNot(trimmedEmail, id)) {
            throw new DuplicateResourceException("Employee with email '" + trimmedEmail + "' already exists.");
        }

        Department department = departmentRepository.findById(request.departmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + request.departmentId()));

        employee.setFirstName(request.firstName().trim());
        employee.setLastName(request.lastName().trim());
        employee.setEmail(trimmedEmail);
        employee.setPhone(request.phone() != null ? request.phone().trim() : null);
        employee.setSalary(request.salary());
        employee.setJoiningDate(request.joiningDate());
        employee.setDepartment(department);

        Employee updatedEmployee = employeeRepository.save(employee);
        return mapToResponse(updatedEmployee);
    }

    @Transactional
    public void deleteEmployee(UUID id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + id));

        employeeRepository.delete(employee);
    }

    private EmployeeResponse mapToResponse(Employee employee) {
        UUID deptId = employee.getDepartment() != null ? employee.getDepartment().getId() : null;
        String deptName = employee.getDepartment() != null ? employee.getDepartment().getName() : null;

        return new EmployeeResponse(
                employee.getId(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getEmail(),
                employee.getPhone(),
                employee.getSalary(),
                employee.getJoiningDate(),
                deptId,
                deptName,
                employee.getCreatedAt()
        );
    }
}
