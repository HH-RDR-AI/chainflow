package ai.hhrdr.chainflow.engine.interceptor;

import ai.hhrdr.chainflow.engine.ethereum.EthereumService;
import org.camunda.bpm.engine.ProcessEngineException;
import org.camunda.bpm.engine.RepositoryService;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.exception.NullValueException;
import org.camunda.bpm.engine.impl.cmd.DeployCmd;
import org.camunda.bpm.engine.impl.cmd.StartProcessInstanceCmd;
import org.camunda.bpm.engine.impl.cmd.SubmitStartFormCmd;
import org.camunda.bpm.engine.impl.interceptor.Command;
import org.camunda.bpm.engine.impl.interceptor.CommandInterceptor;
import org.camunda.bpm.engine.repository.Deployment;
import org.camunda.bpm.engine.repository.ProcessDefinition;
import org.camunda.bpm.engine.runtime.ProcessInstance;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import java.lang.reflect.Field;
import java.math.BigInteger;
import java.util.List;
import java.util.Map;

public class CustomDeploymentInterceptor extends CommandInterceptor {

    private final RuntimeService runtimeService;

    @Autowired
    private EthereumService ethereumService;

    @Autowired
    private RepositoryService repositoryService;

    private static final Logger LOG = LoggerFactory.getLogger(CustomDeploymentInterceptor.class);

    public CustomDeploymentInterceptor(RuntimeService runtimeService) {
        this.runtimeService = runtimeService;
    }

    @Override
    public <T> T execute(Command<T> command) {

        // Before command

        boolean shouldStart = true;

        // Prevent create duplicated instances
        if (command instanceof StartProcessInstanceCmd || command instanceof SubmitStartFormCmd) {
            String businessKey;
            try {
                if (command instanceof SubmitStartFormCmd) {
                    Field field = SubmitStartFormCmd.class.getDeclaredField("businessKey");
                    field.setAccessible(true);
                    businessKey = (String) field.get(command);
                } else  {
                    Field instantiationBuilderField = StartProcessInstanceCmd.class.getDeclaredField("instantiationBuilder");
                    instantiationBuilderField.setAccessible(true);
                    Object instantiationBuilder = instantiationBuilderField.get(command);

                    Field businessKeyField = instantiationBuilder.getClass().getDeclaredField("businessKey");
                    businessKeyField.setAccessible(true);
                    businessKey = (String) businessKeyField.get(instantiationBuilder);
                }

            if (businessKey != null && !businessKey.isEmpty()) {
                List<ProcessInstance> getProcessInstancesByBusinessKey = runtimeService.createProcessInstanceQuery()
                        .processInstanceBusinessKey(businessKey)
                        .list();
                if (!getProcessInstancesByBusinessKey.isEmpty()) {
                    shouldStart = false;
                }
                System.out.println(getProcessInstancesByBusinessKey);

            } else {
                shouldStart = false;
            }

            } catch (NoSuchFieldException | IllegalAccessException e) {
                e.printStackTrace(); // You can log this or handle it as appropriate for your application
            }

        }


        T result = next.execute(command);  // Command execute


        // Deployment process
        if (command instanceof DeployCmd) {
            // Your custom logic after the actual deployment

            System.out.println("After deploying: " + command.getClass().getName());

            Deployment deployment = (Deployment) result;
            String deploymentId = deployment.getId();
            List<ProcessDefinition> processDefinitions = repositoryService.createProcessDefinitionQuery().deploymentId(deploymentId).list();

            System.out.println(processDefinitions);

            for (ProcessDefinition pd : processDefinitions) {
                String processDefinitionKey = pd.getKey();
                String transaction = ethereumService.createDefinition(processDefinitionKey);
                if (transaction.isEmpty()) {
                    // Prevent the deployment
                    throw new ProcessEngineException("Deployment is prevented cause of blockchain transaction fail");
                }
            }
        }


        if (command instanceof StartProcessInstanceCmd || command instanceof SubmitStartFormCmd) {

            ProcessInstance instance = (ProcessInstance) result;
            System.out.println(instance);

            if (!shouldStart) {
                runtimeService.deleteProcessInstance(instance.getProcessInstanceId(), "duplicate");
                return result;
            }

            try {
                runtimeService.suspendProcessInstanceById(instance.getProcessInstanceId());
                Map<String, Object> variables = runtimeService.getVariables(instance.getProcessInstanceId());

                BigInteger neededAmount = BigInteger.valueOf((Long) variables.get("neededAmount"));

                System.out.println(neededAmount);

                String definitionKey = instance.getProcessDefinitionId();
                String processInstanceId = instance.getProcessInstanceId();
                definitionKey = definitionKey.split(":")[0];
                String contractAddress = ethereumService.getContractAddressOfDefinition(definitionKey);

                System.out.println(contractAddress);

                if (command instanceof SubmitStartFormCmd) {
                    String transaction = ethereumService.createProcessInstance(
                            contractAddress,
                            processInstanceId,
                            neededAmount);

                    LOG.info("Process instance created on chain with transaction"
                            + transaction);
                }

                System.out.println(instance);
            }
            catch (NullValueException e) {
                System.out.println("Process not found");
            }


        }

        return result;
    }
}