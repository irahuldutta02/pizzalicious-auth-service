import express, { Request, Response } from "express";
import morgan from "morgan";
import { stream } from "./config/logger";
import { GlobalErrorHandler, notFound } from "./middleware/error.middleware";

const app = express();

// Setup Morgan to log HTTP requests
app.use(morgan("combined", { stream }));

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Service is Alive!" });
});

// Resource not found handler
app.use(notFound);
// Global error handler
app.use(GlobalErrorHandler);

export default app;
