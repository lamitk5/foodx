package com.nhom6.foodx.common.config;

import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;
import reactor.netty.resources.ConnectionProvider;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

/**
 * Cấu hình WebClient dùng chung cho việc gọi API bên ngoài (Groq, Gemini...).
 * Timeout rõ ràng + connection pool riêng để không treo request khi load cao.
 */
@Configuration
public class WebClientConfig {

    private static final int RESPONSE_TIMEOUT_SECONDS = 20;
    private static final int CONNECT_TIMEOUT_MILLIS = 5_000;
    private static final int MAX_CONNECTIONS = 32;
    private static final int PENDING_ACQUIRE_TIMEOUT_MILLIS = 5_000;

    @Bean(destroyMethod = "dispose")
    public ConnectionProvider aiConnectionProvider() {
        return ConnectionProvider.builder("ai-http")
                .maxConnections(MAX_CONNECTIONS)
                .pendingAcquireTimeout(Duration.ofMillis(PENDING_ACQUIRE_TIMEOUT_MILLIS))
                .pendingAcquireMaxCount(MAX_CONNECTIONS * 4)
                .maxIdleTime(Duration.ofSeconds(30))
                .maxLifeTime(Duration.ofMinutes(5))
                .build();
    }

    @Bean
    public WebClient.Builder webClientBuilder(ConnectionProvider aiConnectionProvider) {
        HttpClient httpClient = HttpClient.create(aiConnectionProvider)
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, CONNECT_TIMEOUT_MILLIS)
                .responseTimeout(Duration.ofSeconds(RESPONSE_TIMEOUT_SECONDS))
                .doOnConnected(conn -> conn
                        .addHandlerLast(new ReadTimeoutHandler(RESPONSE_TIMEOUT_SECONDS, TimeUnit.SECONDS))
                        .addHandlerLast(new WriteTimeoutHandler(10, TimeUnit.SECONDS)));

        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .codecs(configurer -> configurer.defaultCodecs()
                        .maxInMemorySize(8 * 1024 * 1024));
    }

    /** WebClient đã build sẵn — dùng lại thay vì .build() mỗi request. */
    @Bean
    public WebClient aiWebClient(WebClient.Builder webClientBuilder) {
        return webClientBuilder.build();
    }
}
