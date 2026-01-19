import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Res,
  HttpStatus,
  Query,
  HttpCode,
  Patch,
  Req,
} from '@nestjs/common';
import { UserService } from '@src/users/users.service';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';
import { ApiOperation, ApiResponse, ApiCookieAuth } from '@nestjs/swagger';

import omit from 'lodash.omit';
import type { Response } from 'express';
import type { Request } from '@src/types';
import { CreateAdminUserDto } from '@src/users/dto/create-admin-user.dto';
import { QueryUserDto } from '@src/users/dto/query-user.dto';
import { UpdateAdminUserDto } from '@src/users/dto/update-admin.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ! finalize driver creation
  @Post('admin-signup')
  @ApiOperation({
    summary:
      'This handles the creation of admins (though route will be removed or disabled in production)',
    description: 'Register new admin using the information provided',
  })
  @ApiResponse({ status: 200, description: 'successs' })
  @HttpCode(HttpStatus.CREATED)
  async createAdminUser(
    @Body() body: CreateAdminUserDto,
    @Res({passthrough: true}) res: Response,
  ) {
    const { user, accessToken, refreshToken } =
      await this.userService.createAdminUser(body);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60, // 1h
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30d
    });

    const safeUser = omit(user, [
      'password',
      'refreshToken',
      'emailVerificationCode',
    ]);

    return { success: true,  user: safeUser };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('admin')
  @ApiOperation({
    summary: 'updates admin fullName',
    description:
      'This endpoint updates the fullname of the admin',
  })
  @ApiCookieAuth('access_token')
  @ApiResponse({ status: 200, description: 'successs' })
  @HttpCode(HttpStatus.OK)
  async updateAdmin(@Body() body: UpdateAdminUserDto, @Req() req: Request) {
    const { id: userId } = req.user;
    const users = await this.userService.updateAdmin(body, userId);

    return { success: true, data: users };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('all')
  @ApiOperation({
    summary: 'This handles the listing of all user based on query',
    description:
      'This list users based on query and its only accessible to admins',
  })
  @ApiCookieAuth('access_token')
  @ApiResponse({ status: 200, description: 'successs' })
  @HttpCode(HttpStatus.OK)
  async listAllUsers(@Query() query: QueryUserDto) {
    const users = await this.userService.listAllUsers(query);

    return { success: true, data: users };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('/driver')
  @ApiOperation({
    summary: 'This loads the comprehensive information of a driver',
    description:
      'Endpoint loads the comprehensive informaton of a driver. Endpoint is only accessible to admins',
  })
  @ApiCookieAuth('access_token')
  @ApiResponse({ status: 200, description: 'successs' })
  @HttpCode(HttpStatus.OK)
  async getFullDriverInformation(@Query('userId') userId: string) {
    const users = await this.userService.getFullDriverInformation(userId);

    return { success: true, data: users };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('/business-owner')
  @ApiOperation({
    summary: 'This loads the comprehensive information of a business Owner',
    description:
      'Endpoint loads the comprehensive informaton of a Business Owner. Endpoint is only accessible to admins',
  })
  @ApiCookieAuth('access_token')
  @ApiResponse({ status: 200, description: 'successs' })
  @HttpCode(HttpStatus.OK)
  async getFullBusinessOwnerInformation(@Query('userId') userId: string) {
    const users =
      await this.userService.getFullBusinessOwnerInformation(userId);

    return { success: true, data: users };
  }
}
