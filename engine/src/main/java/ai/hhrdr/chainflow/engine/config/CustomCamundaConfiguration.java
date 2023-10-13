package ai.hhrdr.chainflow.engine.config;

import org.camunda.bpm.engine.impl.cfg.ProcessEngineConfigurationImpl;
import org.camunda.bpm.spring.boot.starter.configuration.Ordering;
import org.camunda.bpm.spring.boot.starter.configuration.impl.AbstractCamundaConfiguration;
import ai.hhrdr.chainflow.engine.interceptor.CustomDeploymentInterceptor;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(Ordering.DEFAULT_ORDER + 1)
public class CustomCamundaConfiguration extends AbstractCamundaConfiguration {

    @Override
    public void preInit(ProcessEngineConfigurationImpl processEngineConfiguration) {
        CustomDeploymentInterceptor customInterceptor = new CustomDeploymentInterceptor();

        // Add custom interceptor to the chain
        processEngineConfiguration.getCustomPreCommandInterceptorsTxRequired().add(customInterceptor);
        processEngineConfiguration.getCustomPreCommandInterceptorsTxRequiresNew().add(customInterceptor);
    }
}