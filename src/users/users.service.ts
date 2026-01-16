import {
  Injectable,
  Inject,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { jwtConstants } from '@src/auth/jwtContants';

import { UpdatePasswordDto } from '@src/users/dto/updatePasswordDto';
import { UserRepository } from '@src/users/repository/user.repository';
import { EmailService } from '@src/email/email.service';
import { PasswordResetRepository } from '@src/password-reset/repository/password-reset.repository';
import { EmailVerificationRepository } from '@src/email-verification/repository/email-verification.repository';
import { userEnumType } from '@src/users/dto/query-user.dto';
import { CreateAdminUserDto } from '@src/users/dto/create-admin-user.dto';
import { adminInsertType } from '@src/db';
import { QueryUserDto } from '@src/users/dto/query-user.dto';
@Injectable()
export class UserService {
  constructor(
    @Inject('DB')
    private DbProvider: NodePgDatabase<typeof import('@src/db')>,
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
    private jwtService: JwtService,
    private passwordResetRepository: PasswordResetRepository,
    private emailVerificationRepository: EmailVerificationRepository,
  ) {
    this.DbProvider = DbProvider;
  }

  // ! create user here

  async createAdminUser(data: CreateAdminUserDto) {
    const { email, phone, password, fullName } = data;

    const isEmailExisting = await this.userRepository.findByEmailOrPhone({
      email: data.email,
    });
    const isPhoneExisting = await this.userRepository.findByEmailOrPhone({
      phone: data.phone,
    });

    if (isPhoneExisting && isPhoneExisting.phone === data.phone)
      throw new ConflictException('Phone number already exist');
    if (isEmailExisting && isEmailExisting.email === data.email)
      throw new ConflictException('Email already exist');

    // ! ----------------------create admin user--------------------

    const hashedPwd = await bcrypt.hash(password, 10);

    const result = await this.DbProvider.transaction(async (trx) => {
      // First insert - user
      const savedUser = await this.userRepository.createUser(
        {
          email,
          phone,
          password: hashedPwd,
          role: ['admin'],
          emailVerified: true,
        },
        trx,
      );

      if (!savedUser || !savedUser.id) {
        throw new InternalServerErrorException(
          'Could not create user, please try again',
        );
      }

      // Second insert - business owner profile
      const addAdminProfile = await this.userRepository.createAdmin(
        {
          fullName: fullName,
          userId: savedUser.id,
        },
        trx,
      );

      if (!addAdminProfile) {
        throw new InternalServerErrorException(
          'Could not create admin profile, please try again',
        );
      }

      return { savedUser, addAdminProfile };
    });

    const { savedUser } = result;
    const payload = {
      id: savedUser.id,
      email: savedUser.email,
      role: ['admin'],
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: jwtConstants.accessTokenSecret,
      expiresIn: '1h',
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: jwtConstants.refreshTokenSecret,
      expiresIn: '30d',
    });

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    const updateUserToken = await this.userRepository.updateUserToken(
      hashedRefreshToken,
      savedUser.id,
    );

    if (!updateUserToken) throw new InternalServerErrorException();

    return { user: result.savedUser, accessToken, refreshToken };
  }

  async updateAdmin(data: Pick<adminInsertType, 'fullName'>, userId: string) {
    const admin = await this.userRepository.updateAdmin(data, userId);
    return admin;
  }

  async getAdminProfile(userId: string) {
    const admin = await this.userRepository.getAdminProfile(userId);
    return admin;
  }

  // ! this update password is for updating the password from settings
  async updatePassword(data: UpdatePasswordDto, userId: string) {
    const { oldPassword, newPassword, repeatNewPassword } = data;

    console.log(data);

    if (newPassword !== repeatNewPassword)
      throw new BadRequestException(
        'The new password and the repeat new password, does not match, check carefully!',
      );
    const storedPassword = await this.userRepository.getStoredPassword(userId);
    console.log(storedPassword);

    const decodedPassword = await bcrypt.compare(
      oldPassword,
      storedPassword.password,
    );
    console.log(decodedPassword);
    if (!decodedPassword)
      throw new BadRequestException('You have inserted a wrong old password!');

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.updateByUserId(
      { password: hashedNewPassword },
      userId,
    );

    return {
      message: 'Password changed succesfully',
    };
  }

  

  async listAllUsers(query: QueryUserDto) {
    const limit = query.limit || 20;
    const page = query.page || 1;
    const offset = (page - 1) * limit;

    if (query.userType === userEnumType.DRIVERS) {
      return this.userRepository.listAllDrivers(query.approvedStatus, limit, offset);
    }

    if (query.userType === userEnumType.BUSINESSOWNERS) {
      return this.userRepository.listAllBusinessOwners(
        query.approvedStatus,
        limit,
        offset,
      );
    }
  }

  // async listAllDrivers(status: boolean, limit: number, page: number) {
  //   const offset = (page - 1) * limit;
  //   return await this.userRepository.listAllDrivers(status, limit, offset)
  // }
  // async listAllBusinessOwners(status: boolean, limit: number, page: number) {
  //   const offset = (page - 1) * limit;
  //   return await this.userRepository.listAllBusinessOwners(status, limit, offset)
  // }

  async getFullDriverInformation(userId: string) {
    return await this.userRepository.getFullDriverInformation(userId)
  }
  async getFullBusinessOwnerInformation(userId: string) {
    return await this.userRepository.getFullBusinessOwnerInformation(userId)
  }
}
