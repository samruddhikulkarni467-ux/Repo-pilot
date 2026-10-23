
package com.repopilot.backend;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class Healthcontroller {

    @GetMapping("/api/health")
    public String health() {
        return "RepoPilot backend is running!";
    }
}
