import * as argon2 from 'argon2';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { firstName, lastName, email, password } = registerDto;

    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await this.hashPassword(password);

    const user = await this.usersService.createUser({
      firstName,
      lastName,
      email,
      hashedPassword,
    });

    return user;
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new NotFoundException('Invalid credentials');
    }

    const isPasswordValid = await this.verifyPassword(user.password, password);

    if (!isPasswordValid) {
      throw new NotFoundException('Invalid credentials');
    }

    const { password: _, ...userWithoutPassword } = user;
    void _;

    return userWithoutPassword;
  }

  async deserializeUser(payload: { id: string }) {
    const user = await this.usersService.findById(payload.id);

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password: _, ...userWithoutPassword } = user;
    void _;

    return userWithoutPassword;
  }

  private async hashPassword(password: string) {
    return await argon2.hash(password);
  }

  private async verifyPassword(hashedPassword: string, password: string) {
    return await argon2.verify(hashedPassword, password);
  }
}
