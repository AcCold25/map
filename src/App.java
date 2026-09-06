import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.concurrent.Executors;

public class App {
    public static void main(String[] args) throws Exception {
        int port = Integer.parseInt(System.getenv().getOrDefault("ROUTE_ATLAS_PORT", "8080"));
        Path projectRoot = findProjectRoot();
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/", exchange -> serveFile(exchange, projectRoot));
        server.setExecutor(Executors.newCachedThreadPool());
        server.start();
        System.out.printf("Route Atlas is running at http://localhost:%d%n", port);
        Thread.currentThread().join();
    }

    private static Path findProjectRoot() throws Exception {
        Path workingDirectory = Paths.get(System.getProperty("user.dir")).toAbsolutePath().normalize();
        if (Files.isRegularFile(workingDirectory.resolve("index.html"))) {
            return workingDirectory;
        }

        URI classLocation = App.class.getProtectionDomain().getCodeSource().getLocation().toURI();
        Path classDirectory = Paths.get(classLocation).toAbsolutePath().normalize();
        Path compiledProjectRoot = classDirectory.getFileName().toString().equals("bin")
                ? classDirectory.getParent()
                : classDirectory;
        if (compiledProjectRoot != null && Files.isRegularFile(compiledProjectRoot.resolve("index.html"))) {
            return compiledProjectRoot;
        }

        throw new IOException("Could not find index.html from the working directory or compiled class location");
    }

    private static void serveFile(HttpExchange exchange, Path projectRoot) throws IOException {
        if (!exchange.getRequestMethod().equals("GET") && !exchange.getRequestMethod().equals("HEAD")) {
            sendText(exchange, 405, "Method not allowed");
            return;
        }

        String requestPath = exchange.getRequestURI().getPath();
        String relativePath = requestPath.equals("/") ? "index.html" : requestPath.substring(1);
        Path requestedFile = projectRoot.resolve(relativePath).normalize();

        if (!requestedFile.startsWith(projectRoot) || !Files.isRegularFile(requestedFile)) {
            sendText(exchange, 404, "Not found");
            return;
        }

        byte[] content = Files.readAllBytes(requestedFile);
        exchange.getResponseHeaders().set("Content-Type", contentType(requestedFile));
        exchange.getResponseHeaders().set("Cache-Control", "no-cache");
        exchange.sendResponseHeaders(200, content.length);
        if (exchange.getRequestMethod().equals("GET")) {
            try (OutputStream responseBody = exchange.getResponseBody()) {
                responseBody.write(content);
            }
        } else {
            exchange.close();
        }
    }

    private static void sendText(HttpExchange exchange, int status, String message) throws IOException {
        byte[] content = message.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "text/plain; charset=UTF-8");
        exchange.sendResponseHeaders(status, content.length);
        try (OutputStream responseBody = exchange.getResponseBody()) {
            responseBody.write(content);
        }
    }

    private static String contentType(Path file) {
        String name = file.getFileName().toString().toLowerCase();
        if (name.endsWith(".html")) return "text/html; charset=UTF-8";
        if (name.endsWith(".css")) return "text/css; charset=UTF-8";
        if (name.endsWith(".js")) return "text/javascript; charset=UTF-8";
        if (name.endsWith(".json")) return "application/json; charset=UTF-8";
        return "application/octet-stream";
    }
}
