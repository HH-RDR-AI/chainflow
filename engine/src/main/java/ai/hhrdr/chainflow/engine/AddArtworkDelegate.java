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
        String artName = (String) execution.getVariable("art_name");
        String artDescription = (String) execution.getVariable("art_description");
        String imgArtThumbnail = (String) execution.getVariable("img_picture");
        String userId = (String) execution.getVariable("user_id");
        String artDescriptionPrompt = (String) execution.getVariable("art_description_prompt");

        JSONObject json = new JSONObject();
        json.put("art_name", artName);
        json.put("art_description", artDescription);
        json.put("img_picture", imgArtThumbnail);
        json.put("camunda_user_id", userId);
        json.put("art_description_prompt", artDescriptionPrompt);


        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiURL + "/api/arts"))
                .header("Content-Type", "application/json")
                .header("Authorization", apiKey) // Ensure your API key is correctly set up for authorization
                .POST(BodyPublishers.ofString(json.toString()))
                .build();
        try {

            HttpResponse<String> response = client.send(request, BodyHandlers.ofString());
            // Assuming the response body contains a JSON object
            JSONObject art = new JSONObject(response.body());
            String artId = art.getString("id"); // Extracting the 'id' as a string
            execution.setVariable("art_id", artId);
            LOGGER.info("Art creation response status code: " + response.statusCode());
            LOGGER.info("Art creation response body: " + response.body());
            // Optionally, you can handle the response further, for example, to log or process the result.
        } catch (Exception e) {
            LOGGER.severe("Failed to add art. Exception: " + e.getMessage());
            throw e; // Rethrow if you want to indicate failure in the process
        }
    }
}
