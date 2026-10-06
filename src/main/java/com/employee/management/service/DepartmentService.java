package com.employee.management.service;

import com.employee.management.dto.DepartmentRequest;
import com.employee.management.dto.DepartmentResponse;
import com.employee.management.entity.Department;
import com.employee.management.exception.DuplicateResourceException;
import com.employee.management.exception.ResourceConflictException;
import com.employee.management.exception.ResourceNotFoundException;
import com.employee.management.repository.DepartmentRepository;
import com.employee.management.repository.EmployeeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;

    public DepartmentService(DepartmentRepository departmentRepository, EmployeeRepository employeeRepository) {
        this.departmentRepository = departmentRepository;
        this.employeeRepository = employeeRepository;
    }

    @Transactional
    public DepartmentResponse createDepartment(DepartmentRequest request) {
        String trimmedName = request.name().trim();
        if (departmentRepository.existsByNameIgnoreCase(trimmedName)) {
            throw new DuplicateResourceException("Department with name '" + trimmedName + "' already exists.");
        }

        Department department = new Department(trimmedName);
        Department savedDepartment = departmentRepository.save(department);

        return mapToResponse(savedDepartment, 0);
    }

    public List<DepartmentResponse> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(dept -> {
                    long count = employeeRepository.countByDepartmentId(dept.getId());
                    return mapToResponse(dept, count);
                })
                .toList();
    }

    public DepartmentResponse getDepartmentById(UUID id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + id));

        long count = employeeRepository.countByDepartmentId(id);
        return mapToResponse(department, count);
    }

    @Transactional
    public DepartmentResponse updateDepartment(UUID id, DepartmentRequest request) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + id));

        String trimmedName = request.name().trim();
        if (departmentRepository.existsByNameIgnoreCaseAndIdNot(trimmedName, id)) {
            throw new DuplicateResourceException("Department with name '" + trimmedName + "' already exists.");
        }

        department.setName(trimmedName);
        Department updatedDepartment = departmentRepository.save(department);

        long count = employeeRepository.countByDepartmentId(id);
        return mapToResponse(updatedDepartment, count);
    }

    @Transactional
    public void deleteDepartment(UUID id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + id));

        if (employeeRepository.existsByDepartmentId(id)) {
            throw new ResourceConflictException("Cannot delete department with ID: " + id + " because it still has associated employees.");
        }

        departmentRepository.delete(department);
    }

    private DepartmentResponse mapToResponse(Department department, long employeeCount) {
        return new DepartmentResponse(
                department.getId(),
                department.getName(),
                employeeCount,
                department.getCreatedAt()
        );
    }
}
