import { AWS_S3_ENABLED } from "./config/config";
import { createServer } from "./proto/website-server";

(async () => {
  await createServer();

  if (!AWS_S3_ENABLED) {
    const http = await import("http");
    const fs = await import("fs");
    const path = await import("path");
    const port = process.env.CDN_HTTP_PORT || 8090;

    const server = http.createServer(function requestListener(
      request,
      response
    ) {
      const filePath = "." + request.url;
      let contentType = "text/html";

      switch (path.extname(filePath)) {
        case ".js": {
          contentType = "text/javascript";
          break;
        }
        case ".json": {
          contentType = "application/json";
          break;
        }
        case ".css": {
          contentType = "text/css";
          break;
        }
        case ".jpg": {
          contentType = "image/jpg";
          break;
        }
        case ".png": {
          contentType = "image/png";
          break;
        }
        default: {
          contentType = "text/javascript";
        }
      }

      fs.readFile(filePath, function serveFile(error, content) {
        if (error) {
          if (error.code == "ENOENT") {
            response.writeHead(404);
            response.end(`Sorry, page not found: ${error.code} ..\n`);
            response.end();
          } else {
            response.writeHead(500);
            response.end(`Sorry, error with page: ${error.code} ..\n`);
            response.end();
          }
        } else {
          response.writeHead(200, { "Content-Type": contentType });
          response.end(content, "utf-8");
        }
      });
    });

    let portNumber = typeof port === "string" ? parseInt(port, 10) : port;
    let launched = false;

    // server listen with error retry
    const serverListen = (srv: typeof server, port: number) => {
      srv
        .on("error", (e: NodeJS.ErrnoException) => {
          if (e.code === "EADDRINUSE") {
            console.log(`port ${port} is taken.`);
            port += 1;
            srv.close();
            serverListen(srv, port);
          }
        })
        .listen(port, function () {
          if (launched) {
            return;
          }
          const adr = srv.address();
          console.log(
            `Server listening on ${
              typeof adr === "object" ? `http://127.0.0.1:${adr.port}` : adr
            }`
          );
          launched = true;
        });
    };

    serverListen(server, portNumber);
  }
})();
