import { Body, Controller, Post, Version } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Version('1')
  async register(@Body() registerDto: unknown) {
    return this.authService.register(registerDto);
  }

  @Post('register')
  @Version('2')
  async registerV2(@Body() registerDto: unknown) {
    return this.authService.register(registerDto);
  }
}
