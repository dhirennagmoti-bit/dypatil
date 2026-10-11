package com.insurechain;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
public class InsureChainApplication {

    public static void main(String[] args) {
        SpringApplication.run(InsureChainApplication.class, args);
    }
}
