
package com.repopilot.backend;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api")
public class CodeReviewController {

    @PostMapping("/review")
    public Map<String, Object> reviewCode(
            @RequestBody Map<String, String> request) {

        String code = request.get("code");

        List<Map<String, String>> findings = new ArrayList<>();

        if (code == null || code.isBlank()) {
            findings.add(createFinding(
                "RP000",
                "LOW",
                "No code provided",
                "The submitted code is empty.",
                "Submit a code snippet to review."
            ));
        } else {
            if (code.contains("System.out.println(")) {
                findings.add(createFinding(
                    "RP001",
                    "LOW",
                    "Review console output",
                    "System.out.println() may be temporary debugging code.",
                    "Remove unnecessary debugging output or use a logging framework if appropriate."
                ));
            }

            if (code.contains("TODO")) {
                findings.add(createFinding(
                    "RP002",
                    "MEDIUM",
                    "Unfinished work",
                    "A TODO comment was found.",
                    "Complete the task or document why it is being deferred."
                ));
            }

            if (findings.isEmpty()) {
                findings.add(createFinding(
                    "RP000",
                    "INFO",
                    "No basic patterns detected",
                    "The submitted code did not match any configured review rules.",
                    "Continue with testing and a deeper code review."
                ));
            }
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "success");
        response.put("message", "Code analysis completed.");
        response.put("findings", findings);
        response.put("findingCount", findings.size());

        return response;
    }

    private Map<String, String> createFinding(
            String ruleId,
            String severity,
            String title,
            String description,
            String suggestedFix) {

        Map<String, String> finding = new LinkedHashMap<>();
        finding.put("ruleId", ruleId);
        finding.put("severity", severity);
        finding.put("title", title);
        finding.put("description", description);
        finding.put("suggestedFix", suggestedFix);

        return finding;
    }
}
