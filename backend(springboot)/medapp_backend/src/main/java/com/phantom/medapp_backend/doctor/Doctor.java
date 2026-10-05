package com.phantom.medapp_backend.doctor;

import java.util.UUID;

import com.phantom.medapp_backend.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "doctors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private Integer experienceYears;
    private String specialty;
    @Column(length=1000)
    private String bio;
    @OneToOne
    @JoinColumn(name = "user_id" , nullable = false)
    private User user;
    @Column(nullable=false)
    @Builder.Default
    private Integer consultationDuration = 30;
    @Builder.Default
    @Column(nullable=false)
    private boolean active=true;
}
