package com.example.casa_legal_hub_management_system.repository;

import com.example.casa_legal_hub_management_system.model.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findByStaffEmailOrderByTimestampDesc(String staffEmail);
    List<ActivityLog> findAllByOrderByTimestampDesc();
}
