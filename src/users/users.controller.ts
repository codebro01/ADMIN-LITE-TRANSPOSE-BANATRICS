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
  Param,
  ParseUUIDPipe,
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
import { SuspendUserDto } from '@src/users/dto/reject-user.dto';
import { ActivateUserDto } from '@src/users/dto/activate-user.dto';

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
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken } =
      await this.userService.createAdminUser(body);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60, // 1h
    });


    const safeUser = omit(user, [
      'password',
      'emailVerificationCode',
    ]);

    return { success: true, user: safeUser };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('admin')
  @ApiOperation({
    summary: 'updates admin fullName',
    description: 'This endpoint updates the fullname of the admin',
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post(':userId/suspend')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Suspend user by role type',
    description: 'This endpoint enables the suspension of a user',
  })
  @HttpCode(HttpStatus.OK)
  async suspendUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: SuspendUserDto,
  ) {
    const suspendUser = await this.userService.suspendUser(userId, dto.roleType);
    // console.log(suspendUser)
    return { success: true, message: 'User suspended', data: suspendUser };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post(':userId/activate')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Activate user by role type',
    description: 'This endpoint enables the activation of a user',
  })
  @HttpCode(HttpStatus.OK)
  async activateUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: ActivateUserDto,
  ) {
    const activateUser = await this.userService.activateUserByRoleType(userId, dto.roleType);
    return { success: true, message: 'User Activated', data: activateUser };
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('driver/:driverId/approve')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Approved driver kyc',
    description: 'This endpoint enables the approval of a driver kyc',
  })
  @HttpCode(HttpStatus.OK)
  async approveDriver(@Param('driverId', ParseUUIDPipe) driverId: string) {
    await this.userService.approveDriver(driverId);
    return { success: true, message: 'Driver approved' };
  }
}
