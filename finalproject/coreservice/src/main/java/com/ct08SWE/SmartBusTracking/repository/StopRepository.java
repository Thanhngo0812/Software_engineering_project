package com.ct08SWE.SmartBusTracking.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ct08SWE.SmartBusTracking.entity.Stop;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface StopRepository extends JpaRepository<Stop, Integer> {
    List<Stop> findByStopNameContaining(String stopName);
    
    /**
     * Finds stops by name or address, ignoring case, with pagination.
     *
     * @param query The search term for stop name or address.
     * @param pageable The pagination information.
     * @return A page of stops matching the criteria.
     */
    @Query("SELECT s FROM Stop s WHERE " +
           "LOWER(s.stopName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.address) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Stop> findByNameOrAddressContainingIgnoreCase(@Param("query") String query, Pageable pageable);
    Optional<Stop> findById(Long id);
}
