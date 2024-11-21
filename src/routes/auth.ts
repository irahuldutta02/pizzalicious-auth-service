import express, {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";
import { AppDataSource } from "../config/data-source";
import { logger } from "../config/logger";
import { AuthController } from "../controllers/AuthController";
import { RefreshToken } from "../entity/RefreshToken";
import { User } from "../entity/User";
import { TokenService } from "../services/TokenService";
import { UserService } from "../services/UserService";
import registerValidator from "../validators/register-validator";

const authRouter = express.Router();

// repositories
const userRepository = AppDataSource.getRepository(User);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);

// services
const userService = new UserService(userRepository);
const tokenService = new TokenService(refreshTokenRepository);
const authController = new AuthController(userService, logger, tokenService);

authRouter.post("/register", registerValidator, (async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await authController.register(req, res, next);
}) as RequestHandler);

export default authRouter;
