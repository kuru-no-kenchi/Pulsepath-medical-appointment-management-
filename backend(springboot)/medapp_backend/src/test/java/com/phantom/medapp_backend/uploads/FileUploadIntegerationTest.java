package com.phantom.medapp_backend.uploads;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.phantom.medapp_backend.support.IntegrationTestSupport;
import com.phantom.medapp_backend.uploads.UploadProperties;
import com.phantom.medapp_backend.uploads.dto.UploadResponse;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class FileUploadIntegrationTest extends IntegrationTestSupport{
    
    @Autowired
    private UploadProperties properties;

    @Test
    void shouldUploadValidImage() throws Exception {

        createTestAdmin(
                "upload.admin@test.com",
                "Password123!"
        );

        String token = loginAndGetAccessToken(
                "upload.admin@test.com",
                "Password123!"
        );

        byte[] imageContent = "fake-jpeg-content".getBytes();

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "profile.jpg",
                "image/jpeg",
                imageContent
        );

        mockMvc.perform(
                multipart("/upload/test-profile")
                .header(
                                "Authorization",
                                "Bearer " + token
                        )
                        .file(file)
        )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.url").exists())
                .andExpect(jsonPath("$.url").value(
                        org.hamcrest.Matchers.containsString(
                                "/uploads/test-profile/"
                        )
                ));
    }

    @Test
    void shouldUploadValidImageAndStoreIt() throws Exception {

        createTestAdmin(
                "upload1.admin@test.com",
                "Password123!"
        );

        String token = loginAndGetAccessToken(
                "upload1.admin@test.com",
                "Password123!"
        );

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "profile.jpg",
                "image/jpeg",
                "fake-jpeg-content".getBytes()
        );

        String response = mockMvc.perform(
                multipart("/upload/test-profile")
                .header(
                                "Authorization",
                                "Bearer " + token
                        )
                        .file(file)
        )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.url").exists())
                .andReturn()
                .getResponse()
                .getContentAsString();


        UploadResponse uploadResponse
                = objectMapper.readValue(
                        response,
                        UploadResponse.class
                );

        String url = uploadResponse.url();

        assertTrue(
                url.contains("/uploads/test-profile/")
        );

        String filename = url.substring(
                url.lastIndexOf("/") + 1
        );

        Path storedFile = Paths.get(
                properties.getUploadDir(),
                "test-profile",
                filename
        );

        assertTrue(Files.exists(storedFile));
    }

    @Test
    void shouldRejectEmptyFile() throws Exception {

        createTestAdmin(
                "upload2.admin@test.com",
                "Password123!"
        );

        String token = loginAndGetAccessToken(
                "upload2.admin@test.com",
                "Password123!"
        );

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "empty.jpg",
                "image/jpeg",
                new byte[0]
        );

        mockMvc.perform(
                multipart("/upload/test-profile")
                .header(
                                "Authorization",
                                "Bearer " + token
                        )
                        .file(file)
        )
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldRejectUnsupportedFileType() throws Exception {
        createTestAdmin(
                "upload3.admin@test.com",
                "Password123!"
        );

        String token = loginAndGetAccessToken(
                "upload3.admin@test.com",
                "Password123!"
        );

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "malicious.exe",
                "application/x-msdownload",
                "malicious-content".getBytes()
        );

        mockMvc.perform(
                multipart("/upload/test-profile")
                .header(
                                "Authorization",
                                "Bearer " + token
                        )
                        .file(file)
        )
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldRejectFileLargerThan5MB() throws Exception {

        createTestAdmin(
                "upload4.admin@test.com",
                "Password123!"
        );

        String token = loginAndGetAccessToken(
                "upload4.admin@test.com",
                "Password123!"
        );

        byte[] largeFile
                = new byte[(5 * 1024 * 1024) + 1];

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "large.jpg",
                "image/jpeg",
                largeFile
        );

        mockMvc.perform(
                multipart("/upload/test-profile")
                .header(
                                "Authorization",
                                "Bearer " + token
                        )
                        .file(file)
        )
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldAcceptFileExactly5MB() throws Exception {
        createTestAdmin(
                "upload5.admin@test.com",
                "Password123!"
        );

        String token = loginAndGetAccessToken(
                "upload5.admin@test.com",
                "Password123!"
        );

        byte[] content
                = new byte[5 * 1024 * 1024];

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "exact-size.jpg",
                "image/jpeg",
                content
        );

        mockMvc.perform(
                multipart("/upload/test-profile")
                .header(
                                "Authorization",
                                "Bearer " + token
                        )
                        .file(file)
        )
                .andExpect(status().isOk());
    }

    @Test
    void shouldGenerateSafeFilename() throws Exception {

        createTestAdmin(
                "upload6.admin@test.com",
                "Password123!"
        );

        String token = loginAndGetAccessToken(
                "upload6.admin@test.com",
                "Password123!"
        );

        String originalFilename
                = "../../malicious-profile.jpg";

        MockMultipartFile file = new MockMultipartFile(
                "file",
                originalFilename,
                "image/jpeg",
                "image-content".getBytes()
        );

        String response = mockMvc.perform(
                multipart("/upload/test-profile")
                .header(
                                "Authorization",
                                "Bearer " + token
                        )
                        .file(file)
        )
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        assertFalse(
                response.contains("malicious-profile")
        );

        assertFalse(
                response.contains("..")
        );
    }
}
