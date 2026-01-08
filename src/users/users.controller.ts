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
} from '@nestjs/common';
import { UserService } from '@src/users/users.service';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';
import {
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
} from '@nestjs/swagger';

import omit from 'lodash.omit';
import type { Response } from 'express';
import { EarningService } from '@src/earning/earning.service';
import { CreateAdminUserDto } from '@src/users/dto/create-admin-user.dto';
import { QueryUserDto } from '@src/users/dto/query-user.dto';


@Controller('admin')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly earningService: EarningService,
  ) {}

  // ! finalize driver creation
  @Post('signup')
  @ApiOperation({
    summary:
      'This handles the creation of admins (thought route will be disabled in production)',
    description: 'Register new admin using the information provided',
  })
  @ApiResponse({ status: 200, description: 'successs' })
  @HttpCode(HttpStatus.CREATED)
  async createAdminUser(
    @Body() body: CreateAdminUserDto,
    @Res() res: Response,
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

    res.status(HttpStatus.ACCEPTED).json({ user: safeUser, accessToken });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('/all')
  @ApiOperation({
    summary:
      'This handles the creation of admins (thought route will be disabled in production)',
    description: 'Register new admin using the information provided',
  })
  @ApiCookieAuth('access_token')
  @ApiResponse({ status: 200, description: 'successs' })
  @HttpCode(HttpStatus.OK)
  async listAllUsers(@Query() query: QueryUserDto) {
    const users = await this.userService.listAllUsers(query);

    return { success: true, data: users };
  }
}
