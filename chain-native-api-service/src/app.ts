import http from "http";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import registerRoutes from "./routes";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger.json";
import { RESPONSES, RES_MSG } from "./constant";
import logger from "./libs/logger";

export default class App {
  public express: express.Application;

  public httpServer: http.Server;

  public init() {
    this.express = express();
    this.httpServer = http.createServer(this.express);

    this.middleware();
    this.routes();
    this.setupSwaggerDocs();
    this.errorHandler();

    return this.express;
  }

  /**
   * Register routes
   */
  private routes(): void {
    this.express.use("/", registerRoutes());
  }

  /**
   * Config middlewares
   */
  private middleware(): void {
    this.express.use(
      cors({
        origin: environment.corsAllowedOrigins,
        methods: ["GET", "OPTIONS"],
      }),
    );
    this.express.use(helmet());
  }

  private setupSwaggerDocs(): void {
    this.express.use(
      "/api/docs",
      helmet.contentSecurityPolicy({
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
        },
      }),
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument),
    );
  }

  /**
   * Global exception handler for http server (express based server)
   */
  private errorHandler(): void {
    this.express.use(
      (err: Error, _req: Request, res: Response, _next: NextFunction) => {
        logger.error("[GlobalRequestExceptionHandler] Unhandled error:\n", {
          name: err.name,
          message: err.message,
          stack: err.stack,
        });
        res
          .status(RESPONSES.INTERNAL_SERVER)
          .json({ error: true, message: RES_MSG.INTERNAL_SERVER_ERROR });
      },
    );
  }
}
