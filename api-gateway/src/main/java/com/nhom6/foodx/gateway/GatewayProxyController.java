package com.nhom6.foodx.gateway;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Collections;
import java.util.Enumeration;
import java.util.List;
import java.util.Set;

@Slf4j
@RestController
@RequiredArgsConstructor
public class GatewayProxyController {

    private final GatewayProperties properties;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private static final Set<String> HOP_BY_HOP_HEADERS = Set.of(
            "connection", "keep-alive", "proxy-authenticate", "proxy-authorization",
            "te", "trailer", "transfer-encoding", "upgrade", "content-length", "host"
    );

    @RequestMapping(value = "/api/**")
    public ResponseEntity<byte[]> route(
            HttpServletRequest request,
            @RequestBody(required = false) byte[] body) {

        String path = request.getRequestURI();
        String targetBaseUrl = resolveTargetService(path);

        if (targetBaseUrl == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(("{\"code\": 404, \"message\": \"No downstream microservice found for path: " + path + "\"}").getBytes());
        }

        String queryString = request.getQueryString();
        String targetUrl = targetBaseUrl + path + (queryString != null ? "?" + queryString : "");

        URI uri;
        try {
            uri = URI.create(targetUrl);
        } catch (Exception e) {
            try {
                java.net.URL parsedUrl = java.net.URI.create(targetBaseUrl).toURL();
                uri = new URI(parsedUrl.getProtocol(), parsedUrl.getUserInfo(), parsedUrl.getHost(), parsedUrl.getPort(), path, queryString, null);
            } catch (Exception parseEx) {
                log.error("Invalid target URL {}: {}", targetUrl, parseEx.getMessage());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(("{\"code\": 400, \"message\": \"Bad URL: " + parseEx.getMessage() + "\"}").getBytes());
            }
        }

        try {
            HttpRequest.Builder reqBuilder = HttpRequest.newBuilder()
                    .uri(uri)
                    .timeout(Duration.ofSeconds(60));

            // Copy request headers
            Enumeration<String> headerNames = request.getHeaderNames();
            while (headerNames.hasMoreElements()) {
                String headerName = headerNames.nextElement();
                if (!HOP_BY_HOP_HEADERS.contains(headerName.toLowerCase())) {
                    Enumeration<String> values = request.getHeaders(headerName);
                    while (values.hasMoreElements()) {
                        try {
                            reqBuilder.header(headerName, values.nextElement());
                        } catch (IllegalArgumentException ignored) {
                        }
                    }
                }
            }

            // Set method & body
            String method = request.getMethod();
            HttpRequest.BodyPublisher publisher = (body != null && body.length > 0)
                    ? HttpRequest.BodyPublishers.ofByteArray(body)
                    : HttpRequest.BodyPublishers.noBody();
            reqBuilder.method(method, publisher);

            // Execute downstream call
            HttpResponse<byte[]> response = httpClient.send(reqBuilder.build(), HttpResponse.BodyHandlers.ofByteArray());

            // Build client response
            HttpHeaders responseHeaders = new HttpHeaders();
            response.headers().map().forEach((k, v) -> {
                if (!HOP_BY_HOP_HEADERS.contains(k.toLowerCase())) {
                    responseHeaders.put(k, v);
                }
            });

            return new ResponseEntity<>(response.body(), responseHeaders, HttpStatus.valueOf(response.statusCode()));

        } catch (Exception ex) {
            log.error("Error proxying request to {}: {}", targetUrl, ex.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(("{\"code\": 503, \"message\": \"Service Unavailable: " + ex.getMessage() + "\"}").getBytes());
        }
    }

    private String resolveTargetService(String path) {
        if (path.startsWith("/api/auth") || path.startsWith("/api/profile")) {
            return properties.getUserService();
        }
        if (path.startsWith("/api/fridge") || path.startsWith("/api/food") || path.startsWith("/api/ingredients") || path.startsWith("/api/upload")) {
            return properties.getInventoryService();
        }
        if (path.startsWith("/api/recipes") || path.startsWith("/api/home")) {
            return properties.getRecipeService();
        }
        if (path.startsWith("/api/plan") || path.startsWith("/api/shopping")) {
            return properties.getPlanShoppingService();
        }
        if (path.startsWith("/api/ai") || path.startsWith("/api/chat")) {
            return properties.getAiService();
        }
        if (path.startsWith("/api/social") || path.startsWith("/api/stats")) {
            return properties.getSocialStatsService();
        }
        return null;
    }
}
