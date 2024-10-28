import { Config } from "./config";
import app from "./app";
import logger from "./config/logger";

const startServer = () => {
  try {
    app.listen(Config.PORT, () => {
      logger.info(`Server started on port ${Config.PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
};

startServer();
