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
import java.net.http.HttpRequest.BodyPublishers;
import java.net.http.HttpResponse;
import java.net.http.HttpResponse.BodyHandlers;
import java.util.logging.Logger;

@Component("AddAccountDelegate")
public class AddAccountDelegate implements JavaDelegate {

    @Value("${api.url}")
    private String apiURL;

    @Value("${api.key}")
    private String apiKey;

    private static final Logger LOGGER = Logger.getLogger(AddAccountDelegate.class.getName());

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        String accountId = (String) execution.getVariable("account_id");
        String telegramUserId = (String) execution.getVariable("telegram_user_id");
        String accountInfo = (String) execution.getVariable("account_info");
        String accountImgPhoto = (String) execution.getVariable("account_img_photo");
        String personDescriptionPrompt = (String) execution.getVariable("person_description_prompt");
        HttpClient client = HttpClient.newHttpClient();
        JSONObject json = new JSONObject();
        json.put("account_id", accountId);
        json.put("telegram_user_id", telegramUserId);
        json.put("account_info", accountInfo);
        json.put("account_img_photo", accountImgPhoto);
        json.put("person_description_prompt", personDescriptionPrompt);
        HttpRequest request;// Ensure your API key is correctly set up for authorization
        if (accountId != null) {
            request = HttpRequest.newBuilder()
                    .uri(URI.create(apiURL + "/api/accounts/" + accountId))
                    .header("Content-Type", "application/json")
                    .header("Authorization", apiKey) // Ensure your API key is correctly set up for authorization
                    .PUT(BodyPublishers.ofString(json.toString()))
                    .build();
        } else {
            request = HttpRequest.newBuilder()
                    .uri(URI.create(apiURL + "/api/accounts"))
                    .header("Content-Type", "application/json")
                    .header("Authorization", apiKey) // Ensure your API key is correctly set up for authorization
                    .POST(BodyPublishers.ofString(json.toString()))
                    .build();
        }
        try {
            HttpResponse<String> response = client.send(request, BodyHandlers.ofString());

            String accountJson = response.body();
            JSONParser parser = new JSONParser(JSONParser.MODE_PERMISSIVE);
            Object obj = parser.parse(accountJson); // Use Object to hold the parsed result

            if (obj instanceof JSONObject) { // Check if the parsed object is indeed a JSONObject
                JSONObject account = (JSONObject) obj; // Safe casting to JSONObject

                String accountIdRes = (String) account.get("id"); // Now safely extract the 'id'
                execution.setVariable("account_id", accountIdRes);
                LOGGER.info("account creation response status code: " + response.statusCode());
                LOGGER.info("account creation response body: " + response.body());
            } else {
                LOGGER.severe("Parsed response is not a JSON object as expected.");
                // Handle this scenario appropriately (e.g., throw an exception or log a detailed message)
            }
        } catch (Exception e) {
            LOGGER.severe("Failed to add account. Exception: " + e.getMessage());
            throw e; // Re-throw if you want to propagate the error
        }

    }
}
