package ai.hhrdr.chainflow.engine;

import net.minidev.json.JSONObject;
import net.minidev.json.parser.JSONParser;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpRequest.BodyPublishers;
import java.net.http.HttpResponse.BodyHandlers;
import java.util.logging.Logger;

@Component("addEventDelegate")
public class AddEventDelegate implements JavaDelegate {

    @Value("${api.url}")
    private String apiURL;

    @Value("${api.key}")
    private String apiKey;

    private static final Logger LOGGER = Logger.getLogger(AddEventDelegate.class.getName());

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        String eventName = (String) execution.getVariable("event_name");
        String eventDescription = (String) execution.getVariable("event_description");
        String imgEventThumbnail = (String) execution.getVariable("img_event_thumbnail");

        JSONObject json = new JSONObject();
        json.put("event_name", eventName);
        json.put("event_description", eventDescription);
        json.put("img_event_thumbnail", imgEventThumbnail);

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiURL + "/api/events"))
                .header("Content-Type", "application/json")
                .header("Authorization", apiKey) // Ensure your API key is correctly set up for authorization
                .POST(BodyPublishers.ofString(json.toString()))
                .build();
        try {

            HttpResponse<String> response = client.send(request, BodyHandlers.ofString());
            // Assuming the response body contains a JSON list of events
            String eventJson = response.body();
            JSONParser parser = new JSONParser(JSONParser.MODE_PERMISSIVE);
            JSONObject event = (JSONObject) parser.parse(eventJson); // Corrected parsing line

            String eventId = (String) event.get("id"); // Extracting the 'id' as a string
            execution.setVariable("current_event_id", eventId);
            LOGGER.info("Event creation response status code: " + response.statusCode());
            LOGGER.info("Event creation response body: " + response.body());
            // Optionally, you can handle the response further, for example, to log or process the result.
        } catch (Exception e) {
            LOGGER.severe("Failed to add event. Exception: " + e.getMessage());
            throw e; // Rethrow if you want to indicate failure in the process
        }
    }
}
