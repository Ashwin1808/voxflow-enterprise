package com.voxflow.inbound;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.voxflow")
@EnableJpaRepositories(basePackages = "com.voxflow")
@EntityScan(basePackages = "com.voxflow")
public class InboundServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(InboundServiceApplication.class, args);
    }
}
