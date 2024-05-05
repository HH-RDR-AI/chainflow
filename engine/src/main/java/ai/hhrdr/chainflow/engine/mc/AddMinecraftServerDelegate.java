package ai.hhrdr.chainflow.engine.mc;

import java.net.HttpURLConnection;
import java.net.URL;
import java.io.OutputStream;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.util.logging.Logger;

import ai.hhrdr.chainflow.engine.LoggerDelegate;

import com.google.gson.JsonObject;

@Component("minecraftAddDelegate")
public class AddMinecraftServerDelegate implements JavaDelegate {

    @Value("${api.url}")
    private String apiURL;

    @Value("${api.key}")
    private String apiKey;

    private final Logger LOGGER = Logger.getLogger(LoggerDelegate.class.getName());

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        String serverName = (String) execution.getVariable("server_name");
        String serverDescription = (String) execution.getVariable("server_description");
        String serverUrl = (String) execution.getVariable("server_url");
        String serverId = (String) execution.getVariable("server_id");

        LOGGER.info("\n\n  ... AddMinecraftServerDelegate invoked by "
                + "activityName='" + execution.getCurrentActivityName() + "'"
                + ", activityId=" + execution.getCurrentActivityId()
                + ", processDefinitionId=" + execution.getProcessDefinitionId()
                + ", processInstanceId=" + execution.getProcessInstanceId()
                + ", businessKey=" + execution.getProcessBusinessKey()
                + ", executionId=" + execution.getId()
                + ", variables=" + execution.getVariables()
                + " \n\n");

        URL url = new URL(apiURL);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();

        connection.setRequestMethod("POST");
        connection.setRequestProperty("Content-Type", "application/json; utf-8");
        connection.setRequestProperty("Authorization", "Bearer " + apiKey);
        connection.setDoOutput(true);

        JsonObject jsonInput = new JsonObject();
        jsonInput.addProperty("server_name", serverName);
        jsonInput.addProperty("server_description", serverDescription);
        jsonInput.addProperty("server_url", serverUrl);
        jsonInput.addProperty("server_id", serverId);

        try (OutputStream os = connection.getOutputStream()) {
            byte[] input = jsonInput.toString().getBytes(StandardCharsets.UTF_8);
            os.write(input, 0, input.length);
        }

        StringBuilder response = new StringBuilder();
        try (BufferedReader br = new BufferedReader(
                new InputStreamReader(connection.getInputStream(), StandardCharsets.UTF_8))) {
            String responseLine;
            while ((responseLine = br.readLine()) != null) {
                response.append(responseLine.trim());
            }
        }

        LOGGER.info("Response from API: " + response.toString());

        if (connection.getResponseCode() != HttpURLConnection.HTTP_OK) {
            LOGGER.severe("Failed : HTTP error code : " + connection.getResponseCode());
            throw new RuntimeException("Failed : HTTP error code : " + connection.getResponseCode());
        }
    }
}
