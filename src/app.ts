import express, { NextFunction, Request, Response } from "express";
import { HttpError } from "http-errors";
import logger from "./config/logger";

const app = express();

app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to Pizzalicious Auth Service!" });
});

/** global error handler */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message);
  res.status(err.status || 500).json({
    errors: [
      {
        type: err.name,
        meg: err.message,
        path: "",
        location: "",
      },
    ],
    message: err.message,
  });
});

export default app;
