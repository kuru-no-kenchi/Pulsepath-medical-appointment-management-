package com.phantom.medapp_backend.assistant;

import org.springframework.stereotype.Component;
import java.util.List;

import com.phantom.medapp_backend.assistant.dto.AssistantDoctorResponse;
import com.phantom.medapp_backend.assistant.dto.AssistantResponse;

@Component
public class AssistantMapper {

    public AssistantResponse map(Assistant assistant) {
        List<AssistantDoctorResponse> doctors
                = assistant.getDoctors()
                        .stream()
                        .map(d -> new AssistantDoctorResponse(
                        d.getId(),
                        d.getUser().getFirstName(),
                        d.getUser().getLastName(),
                        d.getUser().getEmail(),
                        d.getSpecialty(),
                        0
                ))
                        .toList();
        return new AssistantResponse(
                assistant.getId(),
                assistant.getUser().getFirstName(),
                assistant.getUser().getLastName(),
                assistant.getUser().getEmail(),
                assistant.getUser().getPhone(),
                assistant.getUser().getPhotoUrl(),
                assistant.isActive(),
                doctors
        );
    }

}
