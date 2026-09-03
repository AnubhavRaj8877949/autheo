import Environment from "./environments/environment";
import { setGlobalEnvironment } from "./global";
import logger from "./libs/logger";
import { redisService, rabbitMqService } from "./services";
import App from "./app";

const env: Environment = new Environment();
setGlobalEnvironment(env);

(async () => {
  try {
    function serverError(err: NodeJS.ErrnoException): void {
      logger.error("Error while setting up http server:\n", err);
    }

    const app: App = new App();
    app.init().set("port", env.port);
    const server = app.httpServer;
    server.on("error", serverError);
    server.on("listening", () => {
      logger.info(`Http server listening: ${env.port}`);
    });
    server.listen(env.port);
    redisService.createClientConnection();
    rabbitMqService.startServer();
  } catch (err: any) {
    logger.error("Initialization failed:\n", err);
  }

  // Service level exception event handlers
  process.on("unhandledRejection", (reason: Error) => {
    logger.error("Unhandled Promise Rejection: reason:\n", reason);
  });

  process.on("uncaughtException", (reason: Error) => {
    logger.error("uncaughtException reason:\n", reason);
  });
})();
