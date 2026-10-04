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
            .connectTimeout(Duration.ofSeconds(5))
            .executor(java.util.concurrent.Executors.newFixedThreadPool(
                    100, java.util.concurrent.Executors.defaultThreadFactory()))
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
            byte[] payload = body;
            if ((payload == null || payload.length == 0) && request.getContentLengthLong() > 0) {
                try {
                    payload = request.getInputStream().readAllBytes();
                } catch (Exception ignored) {
                }
            }
            HttpRequest.BodyPublisher publisher = (payload != null && payload.length > 0)
                    ? HttpRequest.BodyPublishers.ofByteArray(payload)
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

            String ct = responseHeaders.getFirst(HttpHeaders.CONTENT_TYPE);
            if (ct != null && ct.contains("application/json") && !ct.toLowerCase().contains("charset")) {
                responseHeaders.set(HttpHeaders.CONTENT_TYPE, "application/json;charset=UTF-8");
            }

            return new ResponseEntity<>(response.body(), responseHeaders, HttpStatus.valueOf(response.statusCode()));

        } catch (Exception ex) {
            log.error("Error proxying request to {}: {}", targetUrl, ex.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(("{\"code\": 503, \"message\": \"Service Unavailable: " + ex.getMessage() + "\"}").getBytes());
        }
    }

    /**
     * Tra service downstream theo bảng định tuyến khai báo trong cấu hình
     * ({@code gateway.routes} ở {@code application.properties}).
     *
     * <p>Tiền tố dài nhất thắng, nên có thể thêm quy tắc cụ thể hơn mà không sợ bị quy tắc
     * chung che mất. {@code /internal/**} không bao giờ được proxy ra ngoài: cổng nội bộ giữa
     * các service chỉ tồn tại trong mạng của cụm.</p>
     */
    private String resolveTargetService(String path) {
        if (path.startsWith("/internal")) {
            return null;
        }
        for (GatewayProperties.Route route : properties.sortedRoutes()) {
            String prefix = route.getPath();
            if (prefix != null && !prefix.isBlank() && path.startsWith(prefix)) {
                return route.getUri();
            }
        }
        return null;
    }
}
