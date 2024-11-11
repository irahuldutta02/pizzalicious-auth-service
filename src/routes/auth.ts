import express, {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";
import { AppDataSource } from "../config/data-source";
import { logger } from "../config/logger";
import { AuthController } from "../controllers/AuthController";
import { User } from "../entity/User";
import { UserService } from "../services/UserService";
import registerValidator from "../validators/register-validator";

const authRouter = express.Router();

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const authController = new AuthController(userService, logger);

authRouter.post("/register", registerValidator, (async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await authController.register(req, res, next);
}) as RequestHandler);

export default authRouter;
