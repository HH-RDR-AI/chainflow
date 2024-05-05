package ai.hhrdr.chainflow.engine.mc;

import java.util.logging.Logger;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component("minecraftDelegate")
public class CallMinecraftPluginDelegate implements JavaDelegate {

    private final Logger LOGGER = Logger.getLogger(CallMinecraftPluginDelegate.class.getName());
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public void execute(DelegateExecution execution) throws Exception {
        LOGGER.info("\n\n  ... CallMinecraftPluginDelegate invoked by "
                + "activityName='" + execution.getCurrentActivityName() + "'"
                + ", activityId=" + execution.getCurrentActivityId()
                + ", processDefinitionId=" + execution.getProcessDefinitionId()
                + ", processInstanceId=" + execution.getProcessInstanceId()
                + ", businessKey=" + execution.getProcessBusinessKey()
                + ", executionId=" + execution.getId()
                + ", variables=" + execution.getVariables()
                + " \n\n");

        String imgArtThumbnail = (String) execution.getVariable("img_art_thumbnail");
        String serverIp = (String) execution.getVariable("server_ip");
        String coordinates = (String) execution.getVariable("coordinates");

        // Parsing the coordinates string (format "(x,y,z)")
        String[] parts = coordinates.replaceAll("[()]", "").split(",");
        if (parts.length != 3) {
            throw new IllegalArgumentException("Invalid coordinates format, expected (x,y,z)");
        }

        String jsonPayload = objectMapper.writeValueAsString(new Coordinates(imgArtThumbnail, parts[0], parts[1], parts[2]));

        sendPostRequest(serverIp, jsonPayload);
    }

    private void sendPostRequest(String serverIp, String jsonPayload) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(new URI("http://" + serverIp + ":8001"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        LOGGER.info("Response from server: " + response.statusCode() + " - " + response.body());
    }

    static class Coordinates {
        public String image_url;
        public String x;
        public String y;
        public String z;

        public Coordinates(String image_url, String x, String y, String z) {
            this.image_url = image_url;
            this.x = x;
            this.y = y;
            this.z = z;
        }
    }
}
