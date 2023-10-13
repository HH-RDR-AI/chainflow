package ai.hhrdr.chainflow.engine.interceptor;

import ai.hhrdr.chainflow.engine.ethereum.EthereumService;
import org.camunda.bpm.engine.ProcessEngineException;
import org.camunda.bpm.engine.impl.cmd.DeployCmd;
import org.camunda.bpm.engine.impl.interceptor.Command;
import org.camunda.bpm.engine.impl.interceptor.CommandInterceptor;
import org.camunda.bpm.engine.impl.repository.DeploymentBuilderImpl;
import org.springframework.beans.factory.annotation.Autowired;

import java.lang.reflect.Field;

public class CustomDeploymentInterceptor extends CommandInterceptor {

    @Autowired
    private EthereumService ethereumService;

    @Override
    public <T> T execute(Command<T> command) {
        // Before the actual command execution
        System.out.println("Before executing command: " + command.getClass().getName());

        if (command instanceof DeployCmd) {
            // Your custom logic after the actual deployment

            System.out.println("Before deploying: " + command.getClass().getName());
            try {
                //TODO: Tech debt. Introspection using not clean
                Field field = DeployCmd.class.getDeclaredField("deploymentBuilder");
                field.setAccessible(true);
                DeploymentBuilderImpl builder = (DeploymentBuilderImpl) field.get(command);
                String deploymentName = builder.getDeployment().getName();
                String transaction = ethereumService.createDefinition(deploymentName);

                if (transaction.isEmpty()) {
                // Prevent the deployment
                    throw new ProcessEngineException("Deployment is prevented cause of blockchain transaction fail");
                }

            } catch (NoSuchFieldException | IllegalAccessException e) {
                e.printStackTrace(); // You can log this or handle it as appropriate for your application
            }
        }

        T result = next.execute(command);  // Continue with the next interceptor in the chain

        // After the actual command execution
        System.out.println("After executing command: " + command.getClass().getName());

        return result;
    }
}