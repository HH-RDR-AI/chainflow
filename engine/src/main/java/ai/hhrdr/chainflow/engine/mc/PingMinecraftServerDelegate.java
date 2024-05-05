package ai.hhrdr.chainflow.engine.mc;

import java.net.HttpURLConnection;
import java.net.URL;
import java.util.logging.Logger;

import ai.hhrdr.chainflow.engine.LoggerDelegate;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;

@Component("minecraftPingDelegate")
public class PingMinecraftServerDelegate implements JavaDelegate {

    private final Logger LOGGER = Logger.getLogger(LoggerDelegate.class.getName());

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        String serverUrl = (String) execution.getVariable("server_url");
        boolean serverAlive = false;

        LOGGER.info("\n\n  ... PingMinecraftServerDelegate invoked by "
                + "activityName='" + execution.getCurrentActivityName() + "'"
                + ", activityId=" + execution.getCurrentActivityId()
                + ", processDefinitionId=" + execution.getProcessDefinitionId()
                + ", processInstanceId=" + execution.getProcessInstanceId()
                + ", businessKey=" + execution.getProcessBusinessKey()
                + ", executionId=" + execution.getId()
                + ", variables=" + execution.getVariables()
                + " \n\n");

        try {
            URL url = new URL("http://" + serverUrl + "/health");
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(5000); // Timeout
            connection.setReadTimeout(5000);

            int status = connection.getResponseCode();
            if (status == HttpURLConnection.HTTP_OK) {
                serverAlive = true;
                LOGGER.info("Server is alive, received HTTP 200 from health check endpoint.");
            } else {
                LOGGER.warning("Failed to receive HTTP 200 from the server, received HTTP " + status);
            }
        } catch (Exception e) {
            LOGGER.severe("Failed to ping server: " + e.getMessage());
        }

        execution.setVariable("server_alive", serverAlive);
    }
}
