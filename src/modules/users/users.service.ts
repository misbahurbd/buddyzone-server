import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async getUserProfile(userId: string, username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      omit: {
        password: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      ...user,
      isCurrentUser: user.id === userId,
    };
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    const { firstName, lastName, photo } = updateUserDto;
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { firstName, lastName, photo },
      omit: {
        password: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      ...user,
      isCurrentUser: user.id === userId,
    };
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async createUser(createUserDto: CreateUserDto) {
    const { firstName, lastName, email, hashedPassword } = createUserDto;

    const username = await this.generateUsername(firstName, lastName);

    const user = await this.prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        username,
        password: hashedPassword,
      },

      omit: {
        password: true,
      },
    });

    return user;
  }

  private sanitizeForUsername(input: string): string {
    // Replace spaces with hyphens, remove all non-alphanumeric characters except hyphens
    return input
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/[^a-z0-9-]/g, '') // Remove all characters except alphanumeric and hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  private async generateUsername(
    firstName: string,
    lastName: string,
    attempt: number = 0,
  ): Promise<string> {
    const maxAttempts = 10;

    // Sanitize inputs
    const sanitizedFirstName = this.sanitizeForUsername(firstName);
    const sanitizedLastName = this.sanitizeForUsername(lastName);

    if (attempt >= maxAttempts) {
      // Fallback to timestamp-based username if we can't find a unique one
      const timestamp = Date.now().toString().slice(-6);
      return `${sanitizedFirstName}-${sanitizedLastName}-${timestamp}`;
    }

    const baseUsername = `${sanitizedFirstName}-${sanitizedLastName}`;
    const username = attempt === 0 ? baseUsername : `${baseUsername}${attempt}`;

    const user = await this.findByUsername(username);
    if (user) {
      return this.generateUsername(firstName, lastName, attempt + 1);
    }

    return username;
  }
}
