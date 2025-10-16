package com.ct08SWE.SmartBusTracking.repository;

import com.ct08SWE.SmartBusTracking.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    // Spring Data JPA sẽ tự động cung cấp các phương thức như findAll(), findById(), save(),...
}
