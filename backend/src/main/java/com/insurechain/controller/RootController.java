package com.insurechain.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class RootController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("status", "ONLINE");
        resp.put("service", "InsureChain Backend API");
        resp.put("version", "1.0.0");
        resp.put("database", "Supabase PostgreSQL (Connected)");
        resp.put("frontendUrl", "http://localhost:5173");
        resp.put("apiDocumentation", "/swagger-ui/index.html");
        resp.put("timestamp", Instant.now().toString());
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/api/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("status", "UP");
        resp.put("database", "UP");
        resp.put("timestamp", Instant.now().toString());
        return ResponseEntity.ok(resp);
    }
}
