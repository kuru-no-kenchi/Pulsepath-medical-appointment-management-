package com.phantom.medapp_backend.uploads;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.phantom.medapp_backend.uploads.dto.UploadResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/upload")
@RequiredArgsConstructor
public class UploadController {

    private final StorageService fileStorageService;

    @PostMapping("/{folder}")
    public ResponseEntity<UploadResponse> uploadFile(
            @PathVariable String folder,
            @RequestParam("file") MultipartFile file
    ) throws Exception {

        String url = fileStorageService.upload(file, folder);

        return ResponseEntity.ok(new UploadResponse(url));
    }
}
