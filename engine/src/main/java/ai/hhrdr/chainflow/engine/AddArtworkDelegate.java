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

@Component("AddArtworkDelegate")
public class AddArtworkDelegate implements JavaDelegate {

    @Value("${api.url}")
    private String apiURL;

    @Value("${api.key}")
    private String apiKey;

    private static final Logger LOGGER = Logger.getLogger(AddArtworkDelegate.class.getName());

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        String artId = (String) execution.getVariable("art_id");
        String artName = (String) execution.getVariable("art_name");
        String artDescription = (String) execution.getVariable("art_description");
        String imgArtThumbnail = (String) execution.getVariable("img_art_thumbnail");
        String artDescriptionPrompt = (String) execution.getVariable("art_description_prompt");
        HttpClient client = HttpClient.newHttpClient();
        JSONObject json = new JSONObject();
        json.put("art_name", artName);
        json.put("art_description", artDescription);
        json.put("img_art_thumbnail", imgArtThumbnail);
        json.put("art_description_prompt", artDescriptionPrompt);
        HttpRequest request;// Ensure your API key is correctly set up for authorization
        if (artId != null) {

            request = HttpRequest.newBuilder()
                    .uri(URI.create(apiURL + "/api/arts/" + artId))
                    .header("Content-Type", "application/json")
                    .header("Authorization", apiKey) // Ensure your API key is correctly set up for authorization
                    .PUT(BodyPublishers.ofString(json.toString()))
                    .build();
        } else {

            request = HttpRequest.newBuilder()
                    .uri(URI.create(apiURL + "/api/arts"))
                    .header("Content-Type", "application/json")
                    .header("Authorization", apiKey) // Ensure your API key is correctly set up for authorization
                    .POST(BodyPublishers.ofString(json.toString()))
                    .build();
        }
        try {
            HttpResponse<String> response = client.send(request, BodyHandlers.ofString());

            String artJson = response.body();
            JSONParser parser = new JSONParser(JSONParser.MODE_PERMISSIVE);
            Object obj = parser.parse(artJson); // Use Object to hold the parsed result

            if (obj instanceof JSONObject) { // Check if the parsed object is indeed a JSONObject
                JSONObject art = (JSONObject) obj; // Safe casting to JSONObject

                String artIdRes = (String) art.get("id"); // Now safely extract the 'id'
                execution.setVariable("art_id", artIdRes);
                LOGGER.info("art creation response status code: " + response.statusCode());
                LOGGER.info("art creation response body: " + response.body());
            } else {
                LOGGER.severe("Parsed response is not a JSON object as expected.");
                // Handle this scenario appropriately (e.g., throw an exception or log a detailed message)
            }
        } catch (Exception e) {
            LOGGER.severe("Failed to add art. Exception: " + e.getMessage());
            throw e; // Re-throw if you want to propagate the error
        }

    }
}
