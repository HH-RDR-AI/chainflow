package ai.hhrdr.chainflow.engine.api.config;

import ai.hhrdr.chainflow.engine.api.CustomRestService;
import org.glassfish.jersey.server.ResourceConfig;
import org.springframework.boot.autoconfigure.jersey.ResourceConfigCustomizer;
import org.springframework.stereotype.Component;

@Component
public class ApiResourceConfigCustomizer implements ResourceConfigCustomizer {

    @Override
    public void customize(ResourceConfig config) {
        config.register(CustomRestService.class);
    }
}