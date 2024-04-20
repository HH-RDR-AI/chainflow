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
import org.json.JSONArray; // Ensure you have a JSON processing library available

@Component("eventsStorage")
public class GetEventsDelegate implements JavaDelegate {

  @Value("${api.url}")
  private String apiURL;

  @Value("${api.key}")
  private String apiKey;

  private static final Logger LOGGER = Logger.getLogger(GetEventsDelegate.class.getName());

  public void execute(DelegateExecution execution) throws Exception {
    // Existing log information here...
    HttpClient client = HttpClient.newHttpClient();

    try {
      HttpRequest req = HttpRequest
              .newBuilder()
              .uri(URI.create(apiURL + "/api/events"))
              .header("Authorization", apiKey)
              .GET() // Use GET method to retrieve data
              .build();

      HttpResponse<String> response = client.send(req, HttpResponse.BodyHandlers.ofString());

      // Assuming the response body contains a JSON list of events
      String eventsJson = response.body();

      JSONArray eventsArray = new JSONArray(eventsJson);
      boolean isEventsListEmpty = eventsArray.length() <= 0;

      // Save the boolean indicator as a process variable
      execution.setVariable("isEventsListEmpty", isEventsListEmpty);

      // Save this list into a process instance variable
      execution.setVariable("events_list", eventsArray.toString());

      LOGGER.info("Events retrieved and stored: " + eventsJson);
    } catch (IOException | InterruptedException e) {
      LOGGER.severe("Failed to retrieve events. \nException: " + e.getMessage());
      execution.setVariable("isEventsListEmpty", true);
    }
  }
}
