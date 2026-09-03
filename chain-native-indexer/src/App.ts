import http from "node:http";
import express from "express";
import registerRoutes from "./routes";
import logger from "./libs/logger";
export default class App {
  public express: express.Application;

  public httpServer: http.Server;

  public async init(): Promise<void> {
    this.express = express();
    this.httpServer = http.createServer(this.express);

    // add all global middleware like cors
    this.middleware();

    // register the all routes
    this.routes();
  }

  /**
   * here register your all routes
   */
  private routes(): void {
    this.express.get("/", this.basePathRoute);
    this.express.use(`/`, registerRoutes());

    this.express.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      const isProd = process.env.NODE_ENV === "production";
      logger.error("unhandled", { err: err?.message, stack: isProd ? undefined : err?.stack });
      res.status(err?.status || 500).json({ 
        error: true,
        message: isProd ? "Internal error" : err?.message 
      });
    });
  }

  /**
   * here you can apply your middlewares
   */
  private middleware() {
    this.express.use(express.json({ limit: "252kb" }));
    this.express.use(express.urlencoded({ limit: "252kb", extended: true }));

   
  }

  private basePathRoute(
    _request: express.Request,
    response: express.Response,
  ): void {
    response.json({ message: "base path" });
  }
}
