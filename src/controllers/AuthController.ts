import { NextFunction, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { JwtPayload } from "jsonwebtoken";
import { Logger } from "winston";
import { CredentialService } from "../services/CredentialService";
import { TokenService } from "../services/TokenService";
import { UserService } from "../services/UserService";
import {
  AuthRequest,
  LoginUserRequest,
  RegisterUserRequest,
  UserWithoutSensitiveData,
} from "../types";

export class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger,
    private tokenService: TokenService,
    private credentialsService: CredentialService,
  ) {}

  async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
    try {
      const result = validationResult(req);

      if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
      }

      const { firstName, lastName, email, password } = req.body;

      this.logger.debug("New request for registering a new user", {
        firstName,
        lastName,
        email,
        password: "********",
      });

      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
      });

      this.logger.info(`User created successfully: ${user.id}`);

      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      };

      const accessToken = this.tokenService.generateAccessToken(payload);

      const newRefreshToken = await this.tokenService.persistRefreshToken(user);

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: newRefreshToken.id,
      });

      res.cookie("accessToken", accessToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60, // 1 hour
        httpOnly: true, // very important
      });

      res.cookie("refreshToken", refreshToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
      });

      res.status(201).json({ id: user.id });
    } catch (error) {
      next(error);
      return;
    }
  }

  async login(req: LoginUserRequest, res: Response, next: NextFunction) {
    try {
      const result = validationResult(req);

      if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
      }

      const { email, password } = req.body;

      this.logger.debug("New request for login a new user", {
        email,
        password: "********",
      });

      const user = await this.userService.findByEmail(email);

      if (!user) {
        const error = createHttpError(400, "Email or password does not match");
        next(error);
        return;
      }

      const passwordMatched = await this.credentialsService.comparePassword(
        password,
        user.password,
      );

      if (!passwordMatched) {
        const error = createHttpError(400, "Email or password does not match");
        next(error);
        return;
      }

      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      };

      const accessToken = this.tokenService.generateAccessToken(payload);

      const newRefreshToken = await this.tokenService.persistRefreshToken(user);

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: newRefreshToken.id,
      });

      res.cookie("accessToken", accessToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60, // 1 hour
        httpOnly: true, // very important
      });

      res.cookie("refreshToken", refreshToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
      });

      this.logger.info("User logged in successfully", {
        id: user.id,
      });

      return res.status(200).json({
        id: user.id,
      });
    } catch (error) {
      next(error);
      return;
    }
  }

  async self(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.findById(Number(req.auth.sub));
      const userWithoutSensitiveData = {
        ...user,
      } as UserWithoutSensitiveData;
      delete userWithoutSensitiveData.password;
      res.status(200).json(userWithoutSensitiveData);
    } catch (error) {
      console.log(error);
      next(error);
      return;
    }
  }
}
