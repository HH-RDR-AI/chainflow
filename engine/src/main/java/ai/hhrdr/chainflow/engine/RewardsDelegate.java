package ai.hhrdr.chainflow.engine;

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

    private static final Logger LOGGER = Logger.getLogger(RewardsDelegate.class.getName());

    public void execute(DelegateExecution execution) {

        LOGGER.info("\n\n  ... RewardsDelegate invoked by "
                + "activityName='" + execution.getCurrentActivityName() + "'"
                + ", activityId=" + execution.getCurrentActivityId()
                + ", processDefinitionId=" + execution.getProcessDefinitionId()
                + ", processInstanceId=" + execution.getProcessInstanceId()
                + ", businessKey=" + execution.getProcessBusinessKey()
                + ", executionId=" + execution.getId()
                + ", variables=" + execution.getVariables()
                + " \n\n");

        // Todo: branch rewards delegate based on current task stage; one branch for posting unclaimed, one for claimed
        // Todo: determine rewards for different processes
        String definitionKey = ((ExecutionEntity) execution).getProcessDefinition().getKey();
        String processInstanceId = execution.getProcessInstanceId();
        HttpClient client = HttpClient.newHttpClient();
        switch (definitionKey) {
            case "warehouse_dashboard_review":
                processReward(client, execution, definitionKey, processInstanceId, 25); // placeholder currently
                break;
            case "warehouse_query_review":
                processReward(client, execution, definitionKey, processInstanceId, 50); // placeholder
                break;
        }
    }

    private void processReward(HttpClient client, DelegateExecution execution,
                               String definitionKey, String processInstanceId,
                               int amountUnclaimed) {
        String json = "{"
                + "\"definition_key\": \"" + definitionKey + "\", "
                + "\"process_instance_id\": \"" + processInstanceId + "\", "
                + "\"amount\": " + 0 + ", "
                + "\"amount_unclaimed\": " + amountUnclaimed
                + "}";

        try {
            sendRequest(client, execution, json);
        } catch (Exception e) {
            LOGGER.severe("Error in processing reward: " + e.getMessage());
        }
    }

    private void sendRequest(HttpClient client, DelegateExecution execution, String json) throws IOException, InterruptedException {
        HttpRequest req = HttpRequest
                .newBuilder()
                .uri(URI.create(apiURL + "/api/points/" + execution.getVariable("user_id")))
                .header("Content-Type", "application/json")
                .header("Authorization", apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();
        HttpResponse<String> response = client.send(req, HttpResponse.BodyHandlers.ofString());
        LOGGER.info("Publish Response Code: " + response.statusCode() + "\nPublish Response Body: " + response.body());
    }
}

