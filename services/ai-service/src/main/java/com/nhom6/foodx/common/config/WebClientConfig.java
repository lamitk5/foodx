package com.nhom6.foodx.common.config;

import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

/**
 * Cấu hình WebClient dùng chung cho việc gọi API bên ngoài (Groq, Gemini...).
 * Có timeout rõ ràng để request không treo vô hạn và fallback sang provider dự phòng nhanh.
 */
@Configuration
public class WebClientConfig {

    /** Thời gian tối đa chờ phản hồi từ AI (giây). */
    private static final int RESPONSE_TIMEOUT_SECONDS = 30;
    /** Thời gian tối đa kết nối tới server AI (ms). */
    private static final int CONNECT_TIMEOUT_MILLIS = 5_000;

    @Bean
    public WebClient.Builder webClientBuilder() {
        HttpClient httpClient = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, CONNECT_TIMEOUT_MILLIS)
                .responseTimeout(Duration.ofSeconds(RESPONSE_TIMEOUT_SECONDS))
                .doOnConnected(conn -> conn
                        .addHandlerLast(new ReadTimeoutHandler(RESPONSE_TIMEOUT_SECONDS, TimeUnit.SECONDS))
                        .addHandlerLast(new WriteTimeoutHandler(15, TimeUnit.SECONDS)));

        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .codecs(configurer -> configurer.defaultCodecs()
                        .maxInMemorySize(16 * 1024 * 1024));
    }
}