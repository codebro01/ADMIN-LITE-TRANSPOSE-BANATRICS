import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Res,
  HttpStatus,
  Req,
  Patch,
} from '@nestjs/common';
import { UserService } from '@src/users/users.service';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';
import {
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiBody,
} from '@nestjs/swagger';

import omit from 'lodash.omit';
import type { Request } from '@src/types';
import type { Response } from 'express';
import { UpdatePasswordDto } from './dto/updatePasswordDto';
import { EarningService } from '@src/earning/earning.service';
import { UpdateAdminUserDto } from '@src/users/dto/update-admin.dto';
import { CreateAdminUserDto } from '@src/users/dto/create-admin-user.dto';


@Controller('admin')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly earningService: EarningService,
  ) {}

  // ! finalize driver creation
  @Post('signup')
  @ApiOperation({
    summary: 'Finalize the creation of a new driver',
    description: 'Register new driver using the information provided',
  })
  @ApiResponse({ status: 200, description: 'successs' })
  async finalizeDriverCreation(
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

  // ! get driver profile

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('profile')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'admin profile info',
    description:
      'Retrieves profile of admin',
  })
  @ApiResponse({ status: 200, description: 'Successfully retrieved admin profile' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  getAdminProfile(@Req() req: Request) {
    const { id: userId } = req.user;
    return this.userService.getAdminProfile(userId);
  }

  // ! update user basic information
  @UseGuards(JwtAuthGuard)
  @Patch('update-profile')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Update admin profile',
    description:
      'Updates basic information of admin',
  })
  @ApiBody({ type:  UpdateAdminUserDto})
  @ApiResponse({
    status: 200,
    description: 'User information successfully updated',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async updateBusinessOwnerProfile(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: UpdateAdminUserDto,
  ) {
    const { id: userId } = req.user;
    const result = await this.userService.updateAdmin(body, userId);
    res.status(HttpStatus.OK).json({
      message: 'success',
      data: result,
    });
  }
 

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('update/password')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Update user password',
    description:
      'Updates the password for the authenticated user. Available to admin, driver, and business owner roles.',
  })
  @ApiBody({ type: UpdatePasswordDto })
  @ApiResponse({ status: 200, description: 'Password successfully updated' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid password format',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async updatePassword(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: UpdatePasswordDto,
  ) {
    const { id: userId } = req.user;

    console.log('got in here');
    const result = await this.userService.updatePassword(body, userId);
    res.status(HttpStatus.OK).json({
      message: 'success',
      data: result,
    });
  }
}
