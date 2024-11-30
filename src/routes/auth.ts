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
import loginValidator from "../validators/login-validator";
import registerValidator from "../validators/register-validator";
import { CredentialService } from "../services/CredentialService";

const authRouter = express.Router();

// repositories
const userRepository = AppDataSource.getRepository(User);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);

// services instances
const userService = new UserService(userRepository);
const tokenService = new TokenService(refreshTokenRepository);
const credentialsService = new CredentialService();

// controller instance
const authController = new AuthController(
  userService,
  logger,
  tokenService,
  credentialsService,
);

authRouter.post("/register", registerValidator, (async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await authController.register(req, res, next);
}) as RequestHandler);

authRouter.post("/login", loginValidator, (async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await authController.login(req, res, next);
}) as RequestHandler);

export default authRouter;
