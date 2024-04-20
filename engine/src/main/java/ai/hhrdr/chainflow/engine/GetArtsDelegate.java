package ai.hhrdr.chainflow.engine;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.json.JSONArray;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.logging.Logger;

@Component("artsStorage")
public class GetArtsDelegate implements JavaDelegate {

  @Value("${api.url}")
  private String apiURL;

  @Value("${api.key}")
  private String apiKey;

  private static final Logger LOGGER = Logger.getLogger(GetArtsDelegate.class.getName());

  public void execute(DelegateExecution execution) throws Exception {
    // Existing log information here...
    HttpClient client = HttpClient.newHttpClient();

    try {
      HttpRequest req = HttpRequest
              .newBuilder()
              .uri(URI.create(apiURL + "/api/arts"))
              .header("Authorization", apiKey)
              .GET() // Use GET method to retrieve data
              .build();

      HttpResponse<String> response = client.send(req, HttpResponse.BodyHandlers.ofString());
      String artsJson = response.body();

      // Assuming the response body contains a JSON list of events
      JSONArray eventsArray = new JSONArray(artsJson);
      boolean isEventsListEmpty = eventsArray.length() <= 0;

      // Save the boolean indicator as a process variable
      execution.setVariable("isArtsListEmpty", isEventsListEmpty);

      // Save this list into a process instance variable
      execution.setVariable("arts_list", eventsArray.toString());

      LOGGER.info("Events retrieved and stored: " + artsJson);
    } catch (IOException | InterruptedException e) {
      LOGGER.severe("Failed to retrieve events. \nException: " + e.getMessage());
    }
  }
}
