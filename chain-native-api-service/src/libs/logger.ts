import { existsSync, mkdirSync } from "fs";
import winston, { Logger } from "winston";

const logLevel = process.env.LOG_LEVEL || "info";
const logToFile = process.env.LOG_TO_FILE === "true";

const transports: winston.transport[] = [new winston.transports.Console()];

if (logToFile) {
  const logDir = "./logs";
  if (!existsSync(logDir)) {
    mkdirSync(logDir);
  }
  transports.push(
    new winston.transports.File({ filename: `${logDir}/combined.log` }),
  );
}

const logger: Logger = winston.createLogger({
  level: logLevel,
  format: winston.format.json(),
  transports,
});

export default logger;
