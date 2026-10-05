package com.phantom.medapp_backend.assistant;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.phantom.medapp_backend.doctor.Doctor;
import com.phantom.medapp_backend.user.User;

public interface AssistantRepository extends JpaRepository<Assistant, UUID>{

    Optional<Assistant> findByUserEmail(String email);
    @Override
    Optional<Assistant> findById(UUID id);

    Optional<Assistant> findByUser(User user);
    
    Optional<Assistant> findByDoctorsContains(Doctor doctor);

}
