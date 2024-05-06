package com.imageapiplugin;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import org.bukkit.plugin.java.JavaPlugin;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;

public class ImageAPIPlugin extends JavaPlugin {
    private HttpServer server;

    @Override
    public void onEnable() {
        int port = 8001;
        startServer(port); // start
        if (server != null) {
            getLogger().info("ImageAPIPlugin has been enabled and HTTP server started on port " + port + ".");
        } else {
            getLogger().severe("Failed to start HTTP server.");
        }
    }

    @Override
    public void onDisable() {
        if (server != null) {
            server.stop(0); // stop
            getLogger().info("com.imageapiplugin.ImageAPIPlugin and its HTTP server have been disabled.");
        }
    }

    private void startServer(int port) {
        try {
            server = HttpServer.create(new InetSocketAddress(port), 0);
            server.createContext("/upload", new ImageHandler(this));
            server.createContext("/health", new HealthCheckHandler());
            server.setExecutor(null); // default executor
            server.start();
        } catch (IOException e) {
            getLogger().severe("Could not start HTTP server: " + e.getMessage());
        }
    }

    static class HealthCheckHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String response = "artMCPlugin Server is healthy!";
            exchange.sendResponseHeaders(200, response.getBytes().length); // 200 OK status
            OutputStream os = exchange.getResponseBody();
            os.write(response.getBytes());
            os.close();
        }
    }
}
