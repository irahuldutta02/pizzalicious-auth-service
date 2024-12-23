import "reflect-metadata";

import express, { Request, Response } from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { stream } from "./config/logger";
import { GlobalErrorHandler, notFound } from "./middleware/error.middleware";
import authRouter from "./routes/auth";
import tenantRouter from "./routes/tenant";

const app = express();
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());

// Setup Morgan to log HTTP requests
app.use(morgan("combined", { stream }));

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Service is Alive" });
});

// Register all the routes
app.use("/auth", authRouter);
app.use("/tenants", tenantRouter);

// Resource not found handler
app.use(notFound);
// Global error handler
app.use(GlobalErrorHandler);

export default app;
