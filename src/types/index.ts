import { Request } from "express";

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginUserData {
  email: string;
  password: string;
}

export interface UserWithoutSensitiveData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: number;
  updatedAt: number;
  password?: string;
}

export interface RegisterUserRequest extends Request {
  body: UserData;
}

export interface LoginUserRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

export interface AuthRequest extends Request {
  auth: {
    sub: string;
    role: string;
  };
}

export type AuthCookie = {
  accessToken: string;
  refreshToken: string;
};
