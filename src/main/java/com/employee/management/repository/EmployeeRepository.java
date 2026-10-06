package com.employee.management.repository;

import com.employee.management.entity.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, UUID> {

    Optional<Employee> findByEmail(String email);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, UUID id);

    boolean existsByDepartmentId(UUID departmentId);

    long countByDepartmentId(UUID departmentId);

    @Query(value = "SELECT e FROM Employee e LEFT JOIN FETCH e.department WHERE " +
            "LOWER(e.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(e.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(e.email) LIKE LOWER(CONCAT('%', :search, '%'))",
            countQuery = "SELECT COUNT(e) FROM Employee e WHERE " +
                    "LOWER(e.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                    "LOWER(e.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                    "LOWER(e.email) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Employee> searchEmployees(@Param("search") String search, Pageable pageable);

    @Query(value = "SELECT e FROM Employee e LEFT JOIN FETCH e.department",
            countQuery = "SELECT COUNT(e) FROM Employee e")
    Page<Employee> findAllWithDepartment(Pageable pageable);
}
