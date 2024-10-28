import { Config } from "./config";
import app from "./app";

const startServer = () => {
  try {
    app.listen(Config.PORT, () => {
      console.log(`Server is running on port ${Config.PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
};

startServer();
