import bcrypt from "bcrypt";
import createHttpError from "http-errors";
import { Repository } from "typeorm";
import { Roles } from "../constants";
import { User } from "../entity/User";
import { UserData } from "../types";

export class UserService {
  constructor(private userRepository: Repository<User>) {}

  async create({ firstName, lastName, email, password }: UserData) {
    // check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw createHttpError(400, "Email already in use");
    }

    // hash the password
    const salt = 10;
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
      const user = await this.userRepository.save({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: Roles.CUSTOMER,
      });

      return user;
    } catch {
      throw createHttpError(500, "Failed to store data in database");
    }
  }

  async findByEmail(email: string) {
    return await this.userRepository.findOne({
      where: { email },
    });
  }

  async findById(id: number) {
    return await this.userRepository.findOne({
      where: { id },
    });
  }
}
