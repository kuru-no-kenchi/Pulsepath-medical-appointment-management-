package com.phantom.medapp_backend.uploads;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.phantom.medapp_backend.exception.ArgumentNotValidException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StorageService {

    private final UploadProperties properties;

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    public String upload(MultipartFile file, String folder) throws IOException {

        if (file.isEmpty()) {
            throw new ArgumentNotValidException("Empty File");
        }

        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new ArgumentNotValidException("Unsupported file type.");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new ArgumentNotValidException("Maximum file size is 5MB.");
        }

        String extension = StringUtils.getFilenameExtension(file.getOriginalFilename());

        String filename = UUID.randomUUID() + "." + extension;

        Path uploadPath = Paths.get(properties.getUploadDir(), folder);

        Files.createDirectories(uploadPath);

        Path target = uploadPath.resolve(filename);

        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        return "/uploads/" + folder + "/" + filename;
    }
}
