import * as http from "http";
import { AddressInfo } from "net";
import Environment from "./environments/environment";
import { setGlobalEnvironment } from "./global";
const env: Environment = new Environment();
setGlobalEnvironment(env);

import App from "./App";
import logger from "./libs/logger";
import cronService from "./cron/index";
import { RedisService } from "./services";
import { connectToDatabase } from "./libs/db";
import processHelper from "./libs/process.helper";
import SocketHelper from "./services/socket.helper";
import cachingHelper from "./libs/caching.helper";

declare global {
  namespace NodeJS {
    interface Global {
      socket?: Socket;
    }
  }
}

const app: App = new App();
let server: http.Server;

function serverError(error: NodeJS.ErrnoException): void {
  throw error;
}

function serverListening(): void {
  const addressInfo: AddressInfo = <AddressInfo>server.address();
  logger.info(`Listening on ${addressInfo.address}:${env.port}`);
  connectToDatabase();
}

app
  .init()
  .then(async () => {
    await RedisService.startRedis();
    cachingHelper.initializeCount();
    cronService.checkValidators();
    cronService.saveTokenPrice();
    !env.catchupDisabled && processHelper.downTimeBlocks();
    processHelper.subscribeLatestBlocks();
    processHelper.subscribeLatestTxs();

    app.express.set("port", env.port);
    server = app.httpServer;
    server.on("error", serverError);
    server.on("listening", serverListening);
    connectSocket(server);
    server.listen(env.port);
  })
  .catch((err: Error) => {
    logger.error("app.init failed:", err);
  });

function connectSocket(serverInstance: http.Server): void {
  const io: NodeJS.Socket = require("socket.io")(serverInstance, {
    cors: {
      origin: env.corsOrigins,
      credentials: true,
    },
    allowEIO3: true,
  });
  const globalData = global as NodeJS.Global;
  globalData.socket = io;
  new SocketHelper(io);
}

process.on("unhandledRejection", (reason: Error) => {
  logger.error("Unhandled Promise Rejection: reason:", reason.message);
  logger.error("reason.stack : ", reason.stack);
});
