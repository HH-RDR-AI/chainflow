package ai.hhrdr.chainflow.engine;

import camundajar.impl.com.google.gson.*;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.camunda.bpm.engine.impl.persistence.entity.ExecutionEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.logging.Logger;

@Component("rewards")
public class RewardsDelegate implements JavaDelegate {

    @Value("${api.url}")
    private String apiURL;

    @Value("${api.key}")
    private String apiKey;

    private static final Logger LOGGER = Logger.getLogger(WarehouseDelegate.class.getName());

    public void execute(DelegateExecution execution) throws Exception {

        LOGGER.info("\n\n  ... RewardsDelegate invoked by "
                + "activityName='" + execution.getCurrentActivityName() + "'"
                + ", activityId=" + execution.getCurrentActivityId()
                + ", processDefinitionId=" + execution.getProcessDefinitionId()
                + ", processInstanceId=" + execution.getProcessInstanceId()
                + ", businessKey=" + execution.getProcessBusinessKey()
                + ", executionId=" + execution.getId()
                + ", variables=" + execution.getVariables()
                + " \n\n");
        /*
         * Variables needed to be added as inputs to process:
         * - user_id
         * - amount
         * - amount_unclaimed
         */
        // Todo: branch rewards delegate based on current task stage; one branch for posting unclaimed, one for claimed
        // Todo: determine rewards for different processes
        String json =
                "{\"definition_key\": " + ((ExecutionEntity) execution).getProcessDefinition().getKey() + ", "
                + "\"process_instance_id\": " + execution.getProcessInstanceId() + ", ";
        HttpClient client = HttpClient.newHttpClient();
        switch (((ExecutionEntity) execution).getProcessDefinition().getKey()) {
            case "warehouse_dashboard_review":
                try {
                    json += "\"amount\": " + 0 + ", "
                            + "\"amount_unclaimed\": " + 25 + "}"; // placeholder
                    sendRequest(client, execution, json);
                }
                catch (Exception e) {
                    LOGGER.severe("Warehouse Delegate failed to update points. \nException: " + e.getMessage());
                }
                break;
            case "warehouse_query_review":
                try {
                    json += "\"amount\": " + 0 + ", "
                            + "\"amount_unclaimed\": " + 50 + "}"; // placeholder
                    sendRequest(client, execution, json);
                }
                catch (Exception e) {
                    LOGGER.severe("Warehouse Delegate failed to update points. \nException: " + e.getMessage());
                }
                break;
        }
    }

    private void sendRequest(HttpClient client, DelegateExecution execution, String json) {
        try {
            HttpRequest req = HttpRequest
                    .newBuilder()
                    .uri(URI.create(apiURL + "/api/points/" + execution.getVariable("user_id")))
                    .header("Content-Type", "application/json")
                    .header("Authorization", apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();
            HttpResponse<String> response = client.send(req, HttpResponse.BodyHandlers.ofString());
            LOGGER.info("Publish Response Code: " + response.statusCode() + "\nPublish Response Body: " + response.body());
        } catch (IOException | InterruptedException e) {
            LOGGER.severe("Error while sending HTTP request: " + e.getMessage());
        }
    }
}

