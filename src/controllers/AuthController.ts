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
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      };

      const accessToken = this.tokenService.generateAccessToken(payload);

      const newRefreshToken = await this.tokenService.persistRefreshToken(user);

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: newRefreshToken.id,
      });

      // Set cookies
      this.tokenService.setCookie(res, {
        accessToken,
        refreshToken,
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
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      };

      const accessToken = this.tokenService.generateAccessToken(payload);

      const newRefreshToken = await this.tokenService.persistRefreshToken(user);

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: newRefreshToken.id,
      });

      // Set cookies
      this.tokenService.setCookie(res, {
        accessToken,
        refreshToken,
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
      next(error);
      return;
    }
  }

  async refresh(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const payload: JwtPayload = {
        sub: req.auth.sub,
        role: req.auth.role,
        firstName: req.auth.firstName,
        lastName: req.auth.lastName,
        email: req.auth.email,
      };

      // Generate new access token
      const accessToken = this.tokenService.generateAccessToken(payload);

      const user = await this.userService.findById(Number(req.auth.sub));
      if (!user) {
        const error = createHttpError(
          400,
          "User with the token could not find",
        );
        next(error);
        return;
      }

      // Persist the refresh token
      const newRefreshToken = await this.tokenService.persistRefreshToken(user);

      // Delete old refresh token
      await this.tokenService.deleteRefreshToken(Number(req.auth.id));

      // Generate new refresh token
      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken.id),
      });

      // Set cookies
      this.tokenService.setCookie(res, {
        accessToken,
        refreshToken,
      });

      this.logger.info(
        "New access token and refresh token have been generated",
      );
      res.json({ id: user.id });
    } catch (error) {
      next(error);
      return;
    }
  }
}
