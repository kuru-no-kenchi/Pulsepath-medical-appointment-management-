package com.phantom.medapp_backend.appointment;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "Availabilty Slots APIs")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/availability")
@RequiredArgsConstructor
public class AvailabilitySlotsController {

    private final AvailableSlotsService availableService;

    @GetMapping("/{doctorId}")
    public ResponseEntity<List<LocalTime>> getAvailableSlots(
            @PathVariable UUID doctorId,
            @RequestParam LocalDate date
    ) {
        return ResponseEntity.ok(availableService.getAvailableSlots(doctorId, date));
    }
}
    