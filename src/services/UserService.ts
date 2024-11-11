import { Repository } from "typeorm";
import { User } from "../entity/User";
import { UserData } from "../types";
import createHttpError from "http-errors";
import { Roles } from "../constants";
import bcrypt from "bcrypt";

export class UserService {
  constructor(private userRepository: Repository<User>) {}

  async create({ firstName, lastName, email, password }: UserData) {
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
      const err = createHttpError(500, "Failed to store data in database");
      throw err;
    }
  }
}
