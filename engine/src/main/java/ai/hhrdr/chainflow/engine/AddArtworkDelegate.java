package ai.hhrdr.chainflow.engine;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpRequest.BodyPublishers;
import java.net.http.HttpResponse.BodyHandlers;
import java.util.logging.Logger;

@Component("addArtDelegate")
public class AddArtworkDelegate implements JavaDelegate {

    @Value("${api.url}")
    private String apiURL;

    @Value("${api.key}")
    private String apiKey;

    private static final Logger LOGGER = Logger.getLogger(AddArtworkDelegate.class.getName());

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        String artId = (String) execution.getVariable("art_id");
        String artName = (String) execution.getVariable("name");
        String artType = (String) execution.getVariable("type");
        String artDescription = (String) execution.getVariable("description");
        String imgArtThumbnail = (String) execution.getVariable("img_picture");
        String userId = (String) execution.getVariable("camunda_user_id");
        String referenceId = (String) execution.getVariable("reference_id");
        String artDescriptionPrompt = (String) execution.getVariable("description_prompt");

        JSONObject json = new JSONObject();
        json.put("name", artName);
        json.put("type", artType);
        json.put("description", artDescription);
        json.put("img_picture", imgArtThumbnail);
        json.put("camunda_user_id", userId);
        json.put("description_prompt", artDescriptionPrompt);
        json.put("reference_id", referenceId);

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request;
        HttpResponse<String> response;

        if (artId == null) {
            // Create new artwork
            request = HttpRequest.newBuilder()
                    .uri(URI.create(apiURL + "/api/arts"))
                    .header("Content-Type", "application/json")
                    .header("Authorization", apiKey)
                    .POST(BodyPublishers.ofString(json.toString()))
                    .build();
        } else {
            // Update existing artwork
            request = HttpRequest.newBuilder()
                    .uri(URI.create(apiURL + "/api/arts/" + artId))
                    .header("Content-Type", "application/json")
                    .header("Authorization", apiKey)
                    .PUT(BodyPublishers.ofString(json.toString()))
                    .build();
        }

        try {
            response = client.send(request, BodyHandlers.ofString());
            if (artId == null) {
                // Extract new art ID and set it in the context if creating new art
                JSONObject art = new JSONObject(response.body());
                artId = art.getString("id");
                execution.setVariable("art_id", artId);
            }
            LOGGER.info("Art operation response status code: " + response.statusCode());
            LOGGER.info("Art operation response body: " + response.body());
        } catch (Exception e) {
            LOGGER.severe("Failed to process art. Exception: " + e.getMessage());
            throw e;
        }
    }
}
