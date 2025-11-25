import { Controller, Get, Param, Put, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { SessionUserDto } from '../auth/dto/session-user.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Body } from '@nestjs/common';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':username')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserProfile(
    @Req() req: Request & { user: SessionUserDto },
    @Param('username') username: string,
  ) {
    const user = await this.usersService.getUserProfile(req.user.id, username);
    return {
      message: 'User profile retrieved successfully',
      data: user,
    };
  }

  @Put('me')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUserProfile(
    @Req() req: Request & { user: SessionUserDto },
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.updateUser(req.user.id, updateUserDto);
    return {
      message: 'User profile updated successfully',
      data: user,
    };
  }
}
