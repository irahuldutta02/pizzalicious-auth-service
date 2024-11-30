import fs from "fs";
import createHttpError from "http-errors";
import { JwtPayload, sign } from "jsonwebtoken";
import path from "path";
import { Repository } from "typeorm";
import { Config } from "../config";
import { RefreshToken } from "../entity/RefreshToken";
import { User } from "../entity/User";
import { AppDataSource } from "../config/data-source";
import { Response } from "express";

export class TokenService {
  constructor(private refreshTokenRepository: Repository<RefreshToken>) {}

  generateAccessToken(payload: JwtPayload) {
    let privateKey: Buffer;

    try {
      privateKey = fs.readFileSync(
        path.join(__dirname, "../../certs/private.pem"),
      );
    } catch {
      const error = createHttpError(500, "Error while reading private key");
      throw error;
    }

    const accessToken = sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "1h",
      issuer: "auth-service",
    });
    return accessToken;
  }

  generateRefreshToken(payload: JwtPayload) {
    const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
      algorithm: "HS256",
      expiresIn: "1y",
      issuer: "auth-service",
      jwtid: String(payload.id),
    });
    return refreshToken;
  }

  async persistRefreshToken(user: User) {
    const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365;
    const newRefreshToken = await this.refreshTokenRepository.save({
      user: user,
      expiresAt: new Date(Date.now() + MS_IN_YEAR),
    });

    return newRefreshToken;
  }

  async deleteRefreshToken(id: number) {
    const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);
    await refreshTokenRepo.delete({
      id,
    });
  }

  setCookie(
    res: Response,
    payload: { accessToken: string; refreshToken: string },
  ) {
    res.cookie("accessToken", payload.accessToken, {
      domain: Config.MAIN_DOMAIN,
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 1, // 1d
      httpOnly: true, // Very important
    });

    res.cookie("refreshToken", payload.refreshToken, {
      domain: Config.MAIN_DOMAIN,
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1y
      httpOnly: true, // Very important
    });
  }
}
