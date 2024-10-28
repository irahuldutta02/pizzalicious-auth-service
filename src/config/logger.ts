import winston from "winston";
import { Config } from ".";

const logger = winston.createLogger({
  level: "info",
  defaultMeta: {
    serviceName: "pizzalicious-auth-service",
    environment: Config.NODE_ENV,
  },
  transports: [
    new winston.transports.File({
      filename: "logs/app.log",
      level: "info",
      format: winston.format.combine(
        winston.format.json(),
        winston.format.timestamp(),
        winston.format.prettyPrint(),
      ),
      silent: Config.NODE_ENV === "test",
    }),
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: winston.format.combine(
        winston.format.json(),
        winston.format.timestamp(),
        winston.format.prettyPrint(),
      ),
      silent: Config.NODE_ENV === "test",
    }),
    new winston.transports.Console({
      level: "info",
      format: winston.format.combine(
        winston.format.json(),
        winston.format.timestamp(),
        winston.format.prettyPrint(),
      ),
      silent: Config.NODE_ENV === "test",
    }),
  ],
});

export default logger;
