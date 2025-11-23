import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

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

  private async generateUsername(
    firstName: string,
    lastName: string,
    attempt: number = 0,
  ): Promise<string> {
    const maxAttempts = 10;
    if (attempt >= maxAttempts) {
      // Fallback to timestamp-based username if we can't find a unique one
      const timestamp = Date.now().toString().slice(-6);
      return `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${timestamp}`;
    }

    const baseUsername = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
    const username = attempt === 0 ? baseUsername : `${baseUsername}${attempt}`;

    const user = await this.findByUsername(username);
    if (user) {
      return this.generateUsername(firstName, lastName, attempt + 1);
    }

    return username;
  }
}
