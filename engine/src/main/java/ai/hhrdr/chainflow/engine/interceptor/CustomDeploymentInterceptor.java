package ai.hhrdr.chainflow.engine.interceptor;

import ai.hhrdr.chainflow.engine.ethereum.EthereumService;
import org.camunda.bpm.engine.ProcessEngineException;
import org.camunda.bpm.engine.impl.interceptor.Command;
import org.camunda.bpm.engine.impl.interceptor.CommandInterceptor;

import org.camunda.bpm.engine.impl.cmd.DeployCmd;
import org.springframework.beans.factory.annotation.Autowired;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;
import org.web3j.abi.FunctionEncoder;

import java.util.Arrays;

public class CustomDeploymentInterceptor extends CommandInterceptor {

    @Autowired
    private EthereumService ethereumService;

    @Override
    public <T> T execute(Command<T> command) {
        // Before the actual command execution
        System.out.println("Before executing command: " + command.getClass().getName());

        if (command instanceof DeployCmd) {
            // Your custom logic after the actual deployment

            //TODO: Add logic, checking that deployment already exist
            System.out.println("Before deploying: " + command.getClass().getName());

            org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(
                    "createDefinition",
                    Arrays.asList(new org.web3j.abi.datatypes.Utf8String("some_hash")),
                    Arrays.asList(new org.web3j.abi.TypeReference<org.web3j.abi.datatypes.Address>() {})
            );

            String encodedFunction = FunctionEncoder.encode(function);

            String transaction = ethereumService.sendRawTransaction("0xC59C109a50F9bE2f8bb02B02e30a043Fc51A7427", encodedFunction);

            if (transaction.isEmpty()) {
                // Prevent the deployment
                throw new ProcessEngineException("Deployment is prevented cause of blockchain transaction fail");
            }


        }

        T result = next.execute(command);  // Continue with the next interceptor in the chain

        // After the actual command execution
        System.out.println("After executing command: " + command.getClass().getName());

        return result;
    }
}