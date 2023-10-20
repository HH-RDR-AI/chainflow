package ai.hhrdr.chainflow.engine.config;

import ai.hhrdr.chainflow.engine.interceptor.CustomDeploymentInterceptor;
import ai.hhrdr.chainflow.engine.plugins.GlobalExecutionListenerParseListener;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.impl.cfg.ProcessEngineConfigurationImpl;
import org.camunda.bpm.spring.boot.starter.configuration.Ordering;
import org.camunda.bpm.spring.boot.starter.configuration.impl.AbstractCamundaConfiguration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.ArrayList;

@Component
@Order(Ordering.DEFAULT_ORDER + 1)
public class CustomCamundaConfiguration extends AbstractCamundaConfiguration {

//    @Autowired
//    private GlobalExecutionListenerParseListener globalExecutionListenerParseListener;

    @Autowired
    @Lazy
    private RuntimeService runtimeService;

    @Override
    public void preInit(ProcessEngineConfigurationImpl processEngineConfiguration) {
        CustomDeploymentInterceptor customInterceptor = new CustomDeploymentInterceptor(runtimeService);

        // Add custom interceptor to the chain
        processEngineConfiguration.getCustomPreCommandInterceptorsTxRequired().add(customInterceptor);
        processEngineConfiguration.getCustomPreCommandInterceptorsTxRequiresNew().add(customInterceptor);
        if (processEngineConfiguration.getCustomPostBPMNParseListeners() == null) {
            processEngineConfiguration.setCustomPostBPMNParseListeners(new ArrayList<>());
        }
//        processEngineConfiguration.getCustomPostBPMNParseListeners().add(globalExecutionListenerParseListener);

    }
}