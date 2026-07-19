package com.voxflow.insurance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.voxflow")
@EnableJpaRepositories(basePackages = "com.voxflow")
@EntityScan(basePackages = "com.voxflow")
public class InsuranceServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(InsuranceServiceApplication.class, args);
    }
}
