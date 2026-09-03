import logger from "../libs/logger";

class SocketHelper {
  public io: NodeJS.Socket;

  constructor(io: NodeJS.Socket) {
    this.io = io;
    this.checkConnection();
    logger.info("WebSocket server is ready to accept the connection");
  }

  checkConnection(): void {
    this.io
      .on("connection", () => {
        logger.info("Socket connected successfully");
      })
      .on("error", (err: Error) => {
        logger.error("Socket error:", err?.message || err);
      })
      .on("disconnect", () => {
        logger.warn("Socket disconnected");
      });
  }
}

export default SocketHelper;
