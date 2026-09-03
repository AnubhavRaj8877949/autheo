import util from "node:util";
import winston, { Logger } from 'winston';

const logger: Logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
       let metaStr = "";

      if (Object.keys(meta).length) {
        metaStr = ` ${  util.inspect(meta, {
          depth: 5,
          breakLength: 120,
        })}`;
      }

      return `${timestamp} [${level}]: ${message}${metaStr}`;
    }),
  ),
  transports: [
    new winston.transports.Console(),
  ],
});

export default logger;
