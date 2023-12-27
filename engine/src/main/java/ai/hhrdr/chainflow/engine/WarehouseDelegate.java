package ai.hhrdr.chainflow.engine;

import camundajar.impl.com.google.gson.Gson;
import org.apache.hc.client5.http.async.methods.SimpleHttpRequest;
import org.apache.hc.client5.http.async.methods.SimpleHttpResponse;
import org.apache.hc.client5.http.async.methods.SimpleRequestBuilder;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.async.CloseableHttpAsyncClient;
import org.apache.hc.client5.http.impl.async.HttpAsyncClients;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.CloseableHttpResponse;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.ContentType;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Future;
import java.util.logging.Logger;

/**
 * This is an easy adapter implementation
 * illustrating how a Java Delegate can be used
 * from within a BPMN 2.0 Service Task.
 */
@Component("warehouse")
public class WarehouseDelegate implements JavaDelegate {

  @Value("${camunda.bpm.api.url}")
  private String apiURL;

  @Value("${camunda.bpm.api.key}")
  private String apiKey;

  private final Logger LOGGER = Logger.getLogger(WarehouseDelegate.class.getName());
  
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

    // Get ID, type of publication (dashboard, query, etc.) make post request to change is_draft to false
    // Precondition: Complete is successful
    Gson gson = new Gson();
    Map<String, Object> jsonMap = new HashMap<>();
    jsonMap.put("is_draft", false);
    String json = gson.toJson(jsonMap);
    if (execution.getProcessDefinitionId().contains("warehouse_query_review")) {
      try (CloseableHttpClient client = HttpClients.createDefault()) {
        HttpPost httpPost = new HttpPost((apiURL + "/api/dashboards/") + execution.getVariable("dashboard_id"));
        httpPost.setEntity(new StringEntity(json));
        httpPost.setHeader("Content-Type", "application/json");
        httpPost.setHeader("Authorization", apiKey);
        try (CloseableHttpResponse response = client.execute(httpPost)) {
          LOGGER.info("Response Code: " + response.getCode());
          LOGGER.info("Response Body: " + EntityUtils.toString(response.getEntity()));
        }
      }
    }
    else if (execution.getProcessDefinitionId().contains("warehouse_real_query_review")) {

    }
  }

}

