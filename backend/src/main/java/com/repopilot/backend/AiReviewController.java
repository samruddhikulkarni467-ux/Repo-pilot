
package com.repopilot.backend;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AiReviewController {

    private final RestClient restClient;

    public AiReviewController() {
        this.restClient = RestClient.create("http://localhost:8000");
    }

    @PostMapping("/ai-review")
    public Map<String, Object> reviewWithAi(
            @RequestBody Map<String, String> request) {

        String code = request.get("code");

        if (code == null || code.isBlank()) {
            Map<String, Object> error = new LinkedHashMap<>();
            error.put("status", "error");
            error.put("message", "Please submit code to review.");
            return error;
        }

        Map<String, Object> pythonRequest = new LinkedHashMap<>();
        pythonRequest.put("code", code);

        Map<?, ?> pythonResponse = restClient.post()
                .uri("/review")
                .body(pythonRequest)
                .retrieve()
                .body(Map.class);

        if (pythonResponse == null) {
            throw new IllegalStateException(
                    "Python AI agent returned an empty response.");
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", pythonResponse.get("status"));
        response.put("message", "Review completed by LangGraph agent.");
        response.put("findings", pythonResponse.get("findings"));
        response.put("findingCount", pythonResponse.get("findingCount"));

        return response;
    }
}
