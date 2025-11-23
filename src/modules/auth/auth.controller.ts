import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ApiCookieAuth, ApiOperation } from '@nestjs/swagger';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ApiSuccessResponse } from 'src/common/decorators/api-success-response.decorator';
import { LoginDto } from './dto/login.dto';
import { Request } from 'express';
import { SessionUserDto } from './dto/session-user.dto';
import { LocalAuthGuard } from './guards/local.guard';
import { AuthenticatedGuard } from './guards/authenticated.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiSuccessResponse({
    status: 201,
    description: 'User registered successfully',
    type: AuthResponseDto,
  })
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Req() req: Request & { user: SessionUserDto },
    @Body() registerDto: RegisterDto,
  ) {
    const user = await this.authService.register(registerDto);

    if (!user) {
      throw new BadRequestException('Failed to register user');
    }

    await this.loginWithSession(req, user);

    return user;
  }

  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiSuccessResponse({
    status: 200,
    description: 'User logged in successfully',
    type: AuthResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async login(
    @Req() req: Request & { user: SessionUserDto },
    @Body() _loginDto: LoginDto,
  ) {
    void _loginDto;

    await this.loginWithSession(req, req.user);

    return {
      message: 'User logged in successfully',
      data: req.user,
    };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout a user' })
  @ApiSuccessResponse({
    status: 200,
    description: 'User logged out successfully',
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  @ApiCookieAuth()
  async logout(@Req() req: Request & { user: SessionUserDto }) {
    await this.logoutFromSession(req);

    return {
      message: 'User logged out successfully',
    };
  }

  @Get('me')
  @ApiOperation({ summary: 'Get the current user' })
  @ApiSuccessResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: SessionUserDto,
  })
  @UseGuards(AuthenticatedGuard)
  @ApiCookieAuth()
  me(@Req() req: Request & { user: SessionUserDto }) {
    return {
      message: 'User retrieved successfully',
      data: req.user,
    };
  }

  private async loginWithSession(
    req: Request & {
      session: { regenerate: (cb: (err?: Error) => void) => void };
      login: (user: SessionUserDto, done: (err?: Error) => void) => void;
    },
    user: SessionUserDto,
  ): Promise<SessionUserDto> {
    return new Promise<SessionUserDto>((resolve, reject) => {
      req.session.regenerate((regenErr: Error | null) => {
        if (regenErr) {
          reject(
            new InternalServerErrorException('Failed to regenerate session'),
          );
        }

        req.logIn(user, (loginErr: Error | null) => {
          if (loginErr) {
            reject(new InternalServerErrorException('Failed to login user'));
          }

          resolve(user);
        });
      });
    });
  }

  private async logoutFromSession(
    req: Request & {
      logout: (cb: (err: Error | null) => void) => void;
      session: { destroy: (cb: (err: Error | null) => void) => void };
    },
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      req.logout((logoutErr: Error | null) => {
        if (logoutErr) {
          reject(new InternalServerErrorException('Failed to logout user'));
          return;
        }

        req.session.destroy((destroyErr: Error | null) => {
          if (destroyErr) {
            reject(
              new InternalServerErrorException('Failed to destroy session'),
            );
            return;
          }

          resolve();
        });
      });
    });
  }
}
