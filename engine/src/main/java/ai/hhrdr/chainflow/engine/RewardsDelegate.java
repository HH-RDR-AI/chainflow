package ai.hhrdr.chainflow.engine;

import camundajar.impl.com.google.gson.*;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.camunda.bpm.engine.impl.persistence.entity.ExecutionEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.FileReader;
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
        Gson gson = new Gson();
        HttpClient amount_client = HttpClient.newHttpClient();
        String amount_response = getRequest(amount_client, execution);
        assert amount_response != null;
        JsonElement jsonElement = JsonParser.parseString(amount_response);
        JsonObject jsonObject = jsonElement.getAsJsonObject();
        JsonArray totals = jsonObject.getAsJsonArray();
        String amount = String.valueOf(totals.get(0));
        String amount_unclaimed = String.valueOf(totals.get(1));

        String json =
                "{\"definition_key\": " + ((ExecutionEntity) execution).getProcessDefinition().getKey() + ", "
                + "\"process_instance_id\": " + execution.getProcessInstanceId() + ", ";
        HttpClient client = HttpClient.newHttpClient();
        switch (((ExecutionEntity) execution).getProcessDefinition().getKey()) {
            case "warehouse_dashboard_review":
                try {
                    json += "\"amount\": " + amount + ", "
                            + "\"amount_unclaimed\": " + (amount_unclaimed + 50) + "}"; // placeholder
                    sendRequest(client, execution, json);
                }
                catch (Exception e) {
                    LOGGER.severe("Warehouse Delegate failed to update points. \nException: " + e.getMessage());
                }
                break;
            case "warehouse_query_review":
                try {
                    json += "\"amount\": " + amount + ", "
                            + "\"amount_unclaimed\": " + (amount_unclaimed + 100) + "}"; // placeholder
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

    private String getRequest(HttpClient client, DelegateExecution execution) {
        try {
            HttpRequest req = HttpRequest
                    .newBuilder()
                    .uri(URI.create(apiURL + "/api/points/" + execution.getVariable("user_id")))
                    .header("Content-Type", "application/json")
                    .header("Authorization", apiKey)
                    .GET()
                    .build();
            HttpResponse<String> response = client.send(req, HttpResponse.BodyHandlers.ofString());
            LOGGER.info("Publish Response Code: " + response.statusCode() + "\nPublish Response Body: " + response.body());
            return response.body();
        } catch (IOException | InterruptedException e) {
            LOGGER.severe("Error while sending HTTP request: " + e.getMessage());
            return null;
        }
    }
}

