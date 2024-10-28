import winston from "winston";
import { Config } from ".";

// Create a logger
export const logger = winston.createLogger({
  level: Config.LOG_LEVEL,
  defaultMeta: {
    serviceName: "pizzalicious-auth-service",
    environment: Config.NODE_ENV,
  },
  transports: [
    new winston.transports.File({
      filename: "logs/app.log",
      format: winston.format.combine(
        winston.format.json(),
        winston.format.timestamp(),
        winston.format.prettyPrint(),
      ),
      silent: Config.NODE_ENV === "test" || Config.NODE_ENV === "production",
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.json(),
        winston.format.timestamp(),
        winston.format.prettyPrint(),
      ),
      silent: Config.NODE_ENV === "test" || Config.NODE_ENV === "production",
    }),
  ],
});

// Create a stream to use with Morgan
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};
