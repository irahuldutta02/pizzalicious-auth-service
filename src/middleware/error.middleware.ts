import { NextFunction, Request, Response } from "express";
import createHttpError, { HttpError } from "http-errors";
import { logger } from "../config/logger";
import { Config } from "../config";

// Catch 404 and forward to error handler
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = createHttpError(404, "Resource not found");
  next(error);
};

// Global error handler
export const GlobalErrorHandler = (
  err: HttpError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  let statusCode = err.status || 500;
  let message = err.message;

  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 400;
    message = "Resource not found";
  }

  const errorObj: {
    type: string;
    meg: string;
    path: string;
    stack?: string;
  } = {
    type: err.name,
    meg: message,
    path: req.path,
  };

  if (Config.NODE_ENV === "development") {
    errorObj.stack = err.stack;
  }

  logger.error(message);
  res.status(statusCode).json({
    errors: [errorObj],
  });
};
