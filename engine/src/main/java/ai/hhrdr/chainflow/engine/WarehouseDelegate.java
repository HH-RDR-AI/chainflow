package ai.hhrdr.chainflow.engine;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.logging.Logger;

/**
 * This is an easy adapter implementation
 * illustrating how a Java Delegate can be used
 * from within a BPMN 2.0 Service Task.
 */
@Component("warehouse")
public class WarehouseDelegate implements JavaDelegate {

  @Value("${api.url}")
  private String apiURL;

  @Value("${api.key}")
  private String apiKey;

  private static final Logger LOGGER = Logger.getLogger(WarehouseDelegate.class.getName());

  public void execute(DelegateExecution execution) throws Exception {

    LOGGER.info("\n\n  ... WarehouseDelegate invoked by "
            + "activityName='" + execution.getCurrentActivityName() + "'"
            + ", activityId=" + execution.getCurrentActivityId()
            + ", processDefinitionId=" + execution.getProcessDefinitionId()
            + ", processInstanceId=" + execution.getProcessInstanceId()
            + ", businessKey=" + execution.getProcessBusinessKey()
            + ", executionId=" + execution.getId()
            + ", variables=" + execution.getVariables()
            + " \n\n");

    String json = "{\"is_draft\":false}";
    HttpClient client = HttpClient.newHttpClient();
    if (execution.getVariable("dashboard_id") != null) {
      HttpRequest req = HttpRequest
              .newBuilder()
              .uri(URI.create(apiURL + "/api/dashboards/" + execution.getVariable("dashboard_id")))
              .header("Content-Type", "application/json")
              .header("Authorization", apiKey)
              .POST(HttpRequest.BodyPublishers.ofString(json))
              .build();
      sendRequest(client, req);
    } else if (execution.getVariable("query_id") != null) {
      HttpRequest req = HttpRequest
              .newBuilder()
              .uri(URI.create(apiURL + "/api/queries/" + execution.getVariable("query_id")))
              .header("Content-Type", "application/json")
              .header("Authorization", apiKey)
              .POST(HttpRequest.BodyPublishers.ofString(json))
              .build();
      sendRequest(client, req);
    }
  }

  private static void sendRequest(HttpClient client, HttpRequest req) {
    try {
      HttpResponse<String> response = client.send(req, HttpResponse.BodyHandlers.ofString());
      LOGGER.info("Publish Response Code: " + response.statusCode() + "\nPublish Response Body: " + response.body());
    } catch (IOException | InterruptedException e) {
      LOGGER.severe("Error while sending HTTP request: " + e.getMessage());
    }
  }
}

